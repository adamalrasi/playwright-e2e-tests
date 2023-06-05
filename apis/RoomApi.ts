import { APIRequestContext, expect } from '@playwright/test';
import { BaseApi } from './BaseApi';
import { BookingApi } from './BookingApi';
import { RoomType, RoomAmenities, getAmenitiesAsList } from '../pages/RoomsPage';
import { getImageUrl } from '../utils/test-data-util';

const path = '/room';

export class RoomApi extends BaseApi {
  readonly bookingApi: BookingApi;

  constructor(request: APIRequestContext) {
    super(request);
    this.bookingApi = new BookingApi(request);
  }

  async createRoom(roomName: string, roomType: RoomType, roomIsAccessible: boolean, roomPrice: number, roomFeatures: RoomAmenities) {
    await this.deleteAllRooms(roomName);
    const response = await this.request.post(`${path}/`, {
      data: {
        roomName: roomName,
        type: roomType,
        accessible: roomIsAccessible.toString(),
        roomPrice: roomPrice.toString(),
        features: getAmenitiesAsList(roomFeatures),
        image: getImageUrl(roomType),
        description: 'Room Created with Automated Test'
      }
    });
    expect(response.status(), `${roomType} Room with name '${roomName}' created`).toBe(201);
  }

  async deleteRoom(roomId: number) {
    await this.bookingApi.deleteAllBookings(roomId);
    const response = await this.request.delete(`${path}/${roomId}`);
    expect([202, 404], `Room with id: ${roomId} deleted`).toContain(response.status());
  }

  async deleteAllRooms(roomName: string) {
    const getRoomsResponse = await this.request.get(`${path}/`);
    expect(getRoomsResponse.status(), 'All rooms fetched').toBe(200);
    const getRoomsData = JSON.parse(await getRoomsResponse.text());
    if (getRoomsData.rooms.length > 0) {
      for (const room of getRoomsData.rooms) {
        if (room.roomName == roomName) await this.deleteRoom(room.roomid);
      }
    }
  }
}

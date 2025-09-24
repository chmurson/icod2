export type RoomTokenProvider = {
  getRoomToken: () => string;
};

export const createRoomTokenProvider = (): RoomTokenProvider => {
  const getRoomToken = (): string => {
    // Implement logic to fetch room token from your backend or any other source
    return "your_room_token_here";
  };

  return {
    getRoomToken,
  };
};

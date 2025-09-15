export type RoomTokenProvider = {
  getRoomToken: () => Promise<string | undefined>;
};

export const createRoomTokenProvider = (): RoomTokenProvider => {
  const getRoomToken = async (): Promise<string> => {
    // Implement logic to fetch room token from your backend or any other source
    return "your_room_token_here";
  };

  return {
    getRoomToken,
  };
};

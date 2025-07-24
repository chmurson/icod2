const OpenBoxButton = () => {
  const receivedKeysByKeyHolderId = useJoinLockedBoxStore(
    (state) => state.receivedKeysByKeyHolderId,
  );

  const key = useJoinLockedBoxStore((state) => state.key);

  const encryptedMessage = useJoinLockedBoxStore(
    (state) => state.encryptedMessage,
  );

  const keys = [...Object.values(receivedKeysByKeyHolderId ?? {}), key];

  return <OpenBoxButtonDumb encryptedMessage={encryptedMessage} keys={keys} />;
};

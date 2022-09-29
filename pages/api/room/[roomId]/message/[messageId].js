import { checkToken } from "../../../../../backendLibs/checkToken";
import {
  readChatRoomsDB,
  writeChatRoomsDB,
} from "../../../../../backendLibs/dbLib";

export default function roomIdMessageIdRoute(req, res) {
  //get ids from url
  const roomId = req.query.roomId;
  const messageId = req.query.messageId;

  //check token
  const user = checkToken(req);
  if (!user) {
    return res.status(401).json({
      ok: false,
      message: "Yon don't permission to access this api",
    });
  }

  const rooms = readChatRoomsDB();

  //check if roomId exist
  const roomIdx = rooms.findIndex((x) => x.roomId === roomId);
  if (roomIdx === -1)
    return res.status(404).json({ ok: false, message: "Invalid room id" });

  //check if messageId exist
  const messageIdx = rooms[roomIdx].messages.findIndex(
    (x) => x.messageId === messageId
  );
  if (messageIdx === -1)
    return res.status(404).json({ ok: false, message: "Invalid message id" });

  //check if token owner is admin, they can delete any message
  //or if token owner is normal user, they can only delete their own message!
  if (user.isAdmin === false) {
    if (
      rooms[roomIdx].messages[messageIdx].username !== user.username.username
    ) {
      return res.status(403).json({
        ok: false,
        message: "You don't have permission to access this data",
      });
    }
  }
  rooms[roomIdx].messages.splice(messageIdx, 1);
  writeChatRoomsDB(rooms);
  return res.json({ ok: true });
}

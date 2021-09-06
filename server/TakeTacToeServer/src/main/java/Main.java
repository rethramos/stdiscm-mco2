import java.util.ArrayList;
import java.util.UUID;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;

public class Main {
    public static void main(String[] args) throws InterruptedException {

        initSocketIO();
    }

    private static void initSocketIO() throws InterruptedException {
        final int MAX_SQUAD_SIZE = 1;

        ArrayList<Player> players = new ArrayList<>();
        ArrayList<BoardState> boards = new ArrayList<>();
        for (int i = 0; i < MAX_SQUAD_SIZE; i++) {
            boards.add(new BoardState(UUID.randomUUID().toString(), null));
        }

        System.out.println("Entered SocketIO.");

        Configuration config = new Configuration();
        config.setHostname("localhost");
        config.setPort(9092);

        final SocketIOServer server = new SocketIOServer(config);

        server.addConnectListener(new ConnectListener() {

            @Override
            public void onConnect(SocketIOClient client) {
                System.out.println("a connection has been established: " + client.getSessionId());
            }
        });

        server.addDisconnectListener(new DisconnectListener() {

            @Override
            public void onDisconnect(SocketIOClient client) {
                for (int i = 0; i < players.size(); i++) {
                    Player player = players.get(i);
                    UUID uuid = UUID.fromString(player.getSessionId());
                    System.out.println(uuid + " " + client.getSessionId());
                    if (uuid.equals(client.getSessionId())) {

                        players.remove(player);
                    }
                }
                System.out.println("a connection has been abolished: " + client.getSessionId());
                System.out.println("Players array: " + players.toString());
            }
        });

        server.addEventListener("playerqueue", Player.class, new DataListener<Player>() {
            @Override
            public void onData(SocketIOClient client, Player p, AckRequest ack) throws Exception {
                if (players.size() == MAX_SQUAD_SIZE * 2) {
                    return;
                }

                System.out.println("player joined: " + p.getUsername() + "session id: " + p.getSessionId());
                players.add(p);
                if (players.indexOf(p) < MAX_SQUAD_SIZE) {
                    p.setSquad(0);
                } else {
                    p.setSquad(1);
                }

                System.out.println("Current players: " + players.toString());
                if (players.size() == MAX_SQUAD_SIZE * 2) {
                    for (int i = 0; i < MAX_SQUAD_SIZE; i++) {
                        String boardId = boards.get(i).getId();
                        players.get(i).setBoardId(boardId);
                        players.get(i + MAX_SQUAD_SIZE).setBoardId(boardId);
                    }
                }
            }

        });

        server.addEventListener("turnchange", BoardState.class, new DataListener<BoardState>() {

            @Override
            public void onData(SocketIOClient socketIOClient, BoardState boardState, AckRequest ackRequest)
                    throws Exception {
                System.out.println("boardState: " + boardState.toString());
            }
        });

        server.start();

        Thread.sleep(Integer.MAX_VALUE);

        server.stop();

        System.out.println("Exit SocketIO.");
    }
}

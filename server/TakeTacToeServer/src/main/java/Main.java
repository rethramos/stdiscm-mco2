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
                // TODO Auto-generated method stub
                System.out.println("a connection has been abolished: " + client.getSessionId());
            }
        });


//        server.addEventListener("chatevent", ChatObject.class, new DataListener<ChatObject>() {
//            @Override
//            public void onData(SocketIOClient client, ChatObject data, AckRequest ackRequest) {
//                // broadcast messages to all clients
//                System.out.println("Send a message to all clients: " + data.getMessage() + ", from: " + data.getUserName());
//                server.getBroadcastOperations().sendEvent("chatevent", data);
//            }
//        });

        server.start();

        Thread.sleep(Integer.MAX_VALUE);

        server.stop();

        System.out.println("Exit SocketIO.");
    }
}

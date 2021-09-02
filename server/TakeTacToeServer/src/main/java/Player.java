public class Player {
    private String username;
    private String piece;

    public Player () {

    }
    public Player(String username, String piece) {
        this.username = username;
        this.piece = piece;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPiece() {
        return piece;
    }

    public void setPiece(String piece) {
        this.piece = piece;
    }
}

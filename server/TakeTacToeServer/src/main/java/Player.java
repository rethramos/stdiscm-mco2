public class Player {
    private String username;
    private char piece;
    private String sessionId;
    private int squad;
    private String boardId;

    public Player() {
        // required empty constructor
    }

    public Player(String username, char piece, String sessionId) {
        this.username = username;
        this.piece = piece;
        this.sessionId = sessionId;
    }

    public int getSquad() {
        return squad;
    }

    public void setSquad(int squad) {
        this.squad = squad;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public char getPiece() {
        return piece;
    }

    public void setPiece(char piece) {
        this.piece = piece;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getBoardId() {
        return boardId;
    }

    public void setBoardId(String boardId) {
        this.boardId = boardId;
    }

    @Override
    public String toString() {
        return "Player: " + getUsername() + " squad: " + getSquad();
    }
}

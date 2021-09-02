public class BoardState {
    private String id;
    private Player turn;
    private char[] board;

    public BoardState() {}

    public BoardState(String id, Player turn){
        this.id = id;
        this.turn = turn;
        this.board =new char[9];

        for (int i = 0; i < this.board.length; i++) {
            board[i] = Pieces.EMPTY;
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Player getTurn() {
        return turn;
    }

    public void setTurn(Player turn) {
        this.turn = turn;
    }

    public char[] getBoard() {
        return board;
    }

    public void setBoard(char[] board) {
        this.board = board;
    }
}

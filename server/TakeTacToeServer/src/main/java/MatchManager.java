public class MatchManager {

    private int[][] winConditions;

    public MatchManager() {
        winConditions = new int[][]{
                {0, 1, 2},
                {3, 4, 5},
                {6, 7, 8},
                {0, 3, 6},
                {1, 4, 7},
                {2, 5, 8},
                {0, 4, 8},
                {2, 4, 6}};

    }

    public boolean checkWin(BoardState bs) {
        char[] board = bs.getBoard();
        for (int[] winCondition : winConditions) {
            if (board[winCondition[0]] == board[winCondition[1]] && board[winCondition[1]] == board[winCondition[2]]) {
                return true;
            }
        }

        return false;
    }

    public boolean isDraw(BoardState bs){
        char[] board = bs.getBoard();
        for(int i = 0; i < 9; i++){
            if(board[i] == Pieces.EMPTY){
                return false;
            }
        }
        
        return true;
    }
}

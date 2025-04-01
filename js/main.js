const game = new Chess();
document.addEventListener('DOMContentLoaded', (event) => {

  let currentTurn = 'white'; // White starts
  const board = Chessboard('board1', {
    draggable: true,
    dropOffBoard: 'snapback',
    position: 'start',
    onDrop: handleMove
  });

  function handleMove(source, target, piece, newPos, oldPos, orientation) {
    const move = game.move({
      from: source,
      to: target,
      promotion: 'q'
    });

    if (move === null) return 'snapback';

    
    currentTurn = currentTurn === 'white' ? 'black' : 'white';
    //updateBoard();
    if (move.flags.includes('k') || move.flags.includes('q')) {
      updateBoard();
    }
    if (currentTurn === 'black') {
      useStockfish();
    }
  }

  function updateBoard() {
    board.position(game.fen(), false);
    if (game.game_over()) {
      alert('Game Over');
      console.log('Game Over');

    }
  }


  /*-------------------------------------------------------------------------------------*/
  //Stockfish

  function initializeStockfish() {
    stockfish = new Worker("js/stockfish/stockfish.js"); 

    stockfish.postMessage("uci");
    stockfish.postMessage("setoption name Threads value 4");
    stockfish.postMessage("setoption name Hash value 1024");
  }

  initializeStockfish();

  // Use Stockfish
  function useStockfish() {
    if (!stockfish) {
      console.error("Stockfish is not initialized.");
      return;
    }

    const fen = game.fen();
    stockfish.postMessage(`position fen ${fen}`);
    stockfish.postMessage("setoption name Skill Level value 10");
    stockfish.postMessage("go depth 15");


    stockfish.onmessage = function(event) {
    const message = event.data;
    if (message.startsWith('bestmove')) {
      const bestMove = message.split(' ')[1];
      const from = bestMove.slice(0, 2);
      const to = bestMove.slice(2, 4);
      game.move({ from, to, promotion: 'q' });
      board.position(game.fen(), true);
      if (game.game_over()) {
        alert('Game Over');
      }
      currentTurn = 'white';
      }
    }
  }

  /*-------------------------------------------------------------------------------------*/

});
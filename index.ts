interface Display {
  bindHandler(clickHandler: (row: number, col: number) => void): void
  createElement(tag: string, className?: string, dataset?: Array<any>): HTMLElement
  getElement(selector: string): HTMLElement
  getAllElements(selector: string): NodeList
  printGameBoard(boardData: Array<Array<string>>): void
  updateBoard(row: number, col: number, currentPlayer: string): void
  clearGameBoard(): void
  printScoreBoard(scoreData: Score): void
  updateScore(currentScore: Score, currentPlayer: string): void
  printMessage(winner?: string): void
  clearMessage(): void
}

interface PlayerMark {
  x: string
  o: string
  [key: string]: string
}

interface Score {
  x: number
  o: number
  [key: string]: number
}

// Display

class DOM implements Display {
  
  bindHandler(clickHandler: (row: number, col: number) => void): void {
    document.addEventListener('click', (event: Event) => {
      const clicked = <HTMLElement>event.target
      const isColumn = clicked.className === 'col'

      if (isColumn) {
        const cell = clicked
        const row = +cell.parentElement!.dataset.row!
        const col = +cell.dataset.col!

        clickHandler(row, col)
      }
    })
  }

  createElement = (tag: string, className?: string, dataset?: Array<any>): HTMLElement => {
    const element = document.createElement(tag)
    if (className) element.classList.add(className)
    if (dataset) element.dataset[dataset[0]] = dataset[1]

    return element
  }

  
  getElement = (selector: string): HTMLElement => <HTMLElement>document.querySelector(selector)

  getAllElements = (selector: string): NodeList => <NodeList>document.querySelectorAll(selector)

  printGameBoard = (boardData: Array<Array<string>>): void => {
    const game = this.getElement('#game')
    const gameBoard = this.createElement('div', 'board', undefined)

    game.append(gameBoard)

    boardData.forEach((row, i) => {
      const boardRow = this.createElement('div', 'row', ['row', i])
      gameBoard.append(boardRow)

      row.forEach((col, j) => {
        const boardCol = this.createElement('div', 'col', ['col', j])
        boardRow.append(boardCol)
      })
    })
  }

  updateBoard = (row: number, col: number, currentPlayer: string): void => {
    const PlayerMark = this.createElement('span', currentPlayer, undefined)
    PlayerMark.textContent = currentPlayer

    const boardRow = this.getElement(`[data-row="${row}"]`)
    const cell = <HTMLElement>boardRow.querySelector(`[data-col="${col}"]`)

    cell.append(PlayerMark)
  }

  clearGameBoard = (): void => {
    const cells = this.getAllElements('.col')

    cells.forEach(cell => {
      cell.textContent = ''
    })
  }

  printScoreBoard = (scoreData: Score): void => {
    const game = this.getElement('#game')
    const scoreBoard = this.createElement('div', 'score')

    game.append(scoreBoard)

    const playerOneScore = this.createElement('div', 'x')
    playerOneScore.textContent = `Player 1: ${scoreData.x}`
    playerOneScore.id = 'score-x'

    const playerTwoScore = this.createElement('div', 'o')
    playerTwoScore.textContent = `Player 2: ${scoreData.o}`
    playerTwoScore.id = 'score-o'

    scoreBoard.append(playerOneScore, playerTwoScore)
  }

  updateScore = (currentScore: Score, currentPlayer: string): void => {
    const currentPlayerScore = this.getElement(`#score-${currentPlayer}`)
    const player = currentPlayer === 'x' ? 'Player 1' : 'Player 2'
    const d: number = currentScore[currentPlayer]
    currentPlayerScore.textContent = `${player}: ${d}`
  }

  printMessage = (winner: string): void => {
    const message = this.createElement('div', 'message')
    const player = winner === 'x' ? 'Player 1' : 'Player 2'

    message.textContent = winner ? `${player} wins!` : 'Nobody wins!'

    const game = this.getElement('#game')
    game.append(message)
  }

  clearMessage = (): void => {
    const message = this.getElement('.message')
    message.remove()
  }
}

class TicTacToe {
  
  display: Display
  board: Array<Array<string>>
  players: PlayerMark
  wait: number
  waiting: boolean
  score: Score
  currentPlayer: string

  constructor(display: Display) {
    this.display = display
    this.board = this.createBoard()
    this.players = { x: 'x', o: 'o' }
    this.wait = 2500
    this.waiting = false
    this.score = { x: 0, o: 0 }
    this.currentPlayer = this.players.x

    this.display.bindHandler(this.clickCell)
  }

  
  clickCell = (row: number, col: number) => {
    const canContinue = this.board[row][col] === ''

    if (canContinue && !this.waiting) {
      this.board[row][col] = this.currentPlayer
      this.display.updateBoard(row, col, this.currentPlayer)

      const win = this.isGameWon(row, col)
      const stalemate = this.board
        .map(row => row.filter(col => col === ''))
        .filter(row => row.length > 0)

      if (!this.waiting) {
        if (win) {
          this.increaseScore()
          this.display.updateScore(this.score, this.currentPlayer)
          this.gameOver(this.currentPlayer)
        } else if (stalemate.length < 1) {
          this.gameOver()
        } else {
          this.switchPlayer()
        }
      }
    }
  }

  gameOver = (winner?: string) => {
    this.waiting = true
    this.display.printMessage(winner)

    setTimeout(() => {
      this.resetBoard()
      this.waiting = false
    }, this.wait)
  }

  createBoard = (): Array<Array<string>> => [['', '', ''], ['', '', ''], ['', '', '']]

  resetBoard = (): void => {
    this.display.clearMessage()
    this.display.clearGameBoard()
    this.board = this.createBoard()
  }

  isGameWon = (row: number, col: number): boolean => {
    if (
       // Vertical win
       (this.board[0][col] === this.currentPlayer &&
        this.board[1][col] === this.currentPlayer &&
        this.board[2][col] === this.currentPlayer) ||

      // Horizontal win
      (this.board[row][0] === this.currentPlayer &&
        this.board[row][1] === this.currentPlayer &&
        this.board[row][2] === this.currentPlayer) ||

      // Diagonal win
      ((this.board[0][0] === this.currentPlayer &&
        this.board[1][1] === this.currentPlayer &&
        this.board[2][2] === this.currentPlayer) ||
        (this.board[2][0] === this.currentPlayer &&
          this.board[1][1] === this.currentPlayer &&
          this.board[0][2] === this.currentPlayer))
    )
      return true
    return false
  }

  
   //Switch player
  
  switchPlayer = (): void => {
    this.currentPlayer = this.currentPlayer === this.players.x ? this.players.o : this.players.x
  }

  
   //Increase score - winning player
   
  increaseScore = (): void => {
    this.score[this.currentPlayer] += 1
  }

  
   // Render score board & game board
  
  startGame(): void {
    this.display.printScoreBoard(this.score)
    this.display.printGameBoard(this.board)
  }
}

// Start Game

const ticTacToe = new TicTacToe(new DOM())
ticTacToe.startGame()

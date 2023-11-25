import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MafiaBoard from './MafiaBoard';
import MafiaAreaController from '../../../../classes/interactable/MafiaAreaController';
import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import React from 'react';
import { GameArea, MafiaGameState, PlayerID } from '../../../../types/CoveyTownSocket';
import TownController from '../../../../classes/TownController';
import { act } from 'react-dom/test-utils';

const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  const mockUseToast = () => mockToast;
  return {
    ...ui,
    useToast: mockUseToast,
  };
});

class MockMafiaAreaController extends MafiaAreaController {
  makeMove = jest.fn();

  mockPlayersAlive: PlayerID[] = [];

  mockIsPlayer = false;

  mockIsPlayerTurn = false;

  public constructor() {
    super(nanoid(), mock<GameArea<MafiaGameState>>(), mock<TownController>());
  }

  get PlayersAlive() {
    return [...this.mockPlayersAlive];
  }

  get isPlayerTurn() {
    return this.mockIsPlayerTurn;
  }

  get isPlayer() {
    return this.mockIsPlayer;
  }

  public mockReset() {
    this.mockPlayersAlive = [
      'player1',
      'player2',
      'player3',
      'player4',
      'player5',
      'player5',
      'player6',
    ];
    this.makeMove.mockReset();
  }
}
describe('MafiaBoard', () => {
  // Spy on console.error and intercept react key warnings to fail test
  let consoleErrorSpy: jest.SpyInstance<void, [message?: any, ...optionalParms: any[]]>;
  beforeAll(() => {
    // Spy on console.error and intercept react key warnings to fail test
    consoleErrorSpy = jest.spyOn(global.console, 'error');
    consoleErrorSpy.mockImplementation((message?, ...optionalParams) => {
      const stringMessage = message as string;
      if (stringMessage.includes && stringMessage.includes('children with the same key,')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      } else if (stringMessage.includes && stringMessage.includes('warning-keys')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      }
      // eslint-disable-next-line no-console -- we are wrapping the console with a spy to find react warnings
      console.warn(message, ...optionalParams);
    });
  });
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  const gameAreaController = new MockMafiaAreaController();
  beforeEach(() => {
    gameAreaController.mockReset();
    mockToast.mockReset();
  });
  async function checkBoard({
    clickable,
    checkMakeMove,
    checkToast,
  }: {
    clickable?: boolean;
    checkMakeMove?: boolean;
    checkToast?: boolean;
  }) {
    const players = screen.getAllByRole('button');
    // There should be exactly 6 buttons: one per-player
    expect(players).toHaveLength(6);
    // Each player button should have the correct aria-label
    for (let i = 0; i < 6; i++) {
      expect(players[i]).toHaveAttribute('aria-label', `Player ${i + 1}`);
    }
    // Test if each player button has the correct text content
    for (let i = 0; i < 6; i++) {
      const player = gameAreaController.playersAlive[i];
      expect(players[i]).toHaveTextContent(player);
    }
    if (clickable) {
      // Each player should be clickable if it is the player's turn
      for (let i = 0; i < 6; i++) {
        expect(players[i]).toBeEnabled();
        gameAreaController.makeMove.mockReset();
        mockToast.mockClear();

        fireEvent.click(players[i]);
        if (checkMakeMove) {
          expect(gameAreaController.makeMove).toBeCalledWith(gameAreaController.playersAlive[i]);
          if (checkToast) {
            gameAreaController.makeMove.mockClear();
            expect(mockToast).not.toBeCalled();
            mockToast.mockClear();
            const expectedMessage = `Invalid Move ${nanoid()}}`;
            gameAreaController.makeMove.mockRejectedValue(new Error(expectedMessage));
            fireEvent.click(players[i]);
            await waitFor(() => {
              expect(mockToast).toBeCalledWith(
                expect.objectContaining({
                  status: 'error',
                  description: `Error: ${expectedMessage}`,
                }),
              );
            });
          }
        }
      }
    } else {
      // Each player should be disabled if it is not the player's turn
      for (let i = 0; i < 6; i++) {
        expect(players[i]).toBeDisabled();
      }
    }
  }
  describe('[T3.1] When observing the game', () => {
    beforeEach(() => {
      gameAreaController.mockIsPlayer = false;
    });
    it('renders the players Alive with the correct number of players', async () => {
      render(<MafiaBoard gameAreaController={gameAreaController} />);
      const playerButtons = screen.getAllByRole('button');
      // There should be exactly 6 buttons: one per-person (and no other buttons in this component)
      expect(playerButtons).toHaveLength(6);
      // Each player button should have the correct aria-label
      for (let i = 0; i < 6; i++) {
        expect(playerButtons[i]).toHaveAttribute('aria-label', `Player ${i + 1}`);
      }
      // Each player button should have the correct text content
      for (let i = 0; i < 6; i++) {
        expect(playerButtons[i]).toHaveTextContent(`player${i + 1}`);
      }
    });
    it('does not make a move when a player button is clicked, and button is disabled', async () => {
      render(<MafiaBoard gameAreaController={gameAreaController} />);
      const playerButtons = screen.getAllByRole('button');
      for (let i = 0; i < 6; i++) {
        expect(playerButtons[i]).toBeDisabled();
        fireEvent.click(playerButtons[i]);
        expect(gameAreaController.makeMove).not.toHaveBeenCalled();
        expect(mockToast).not.toHaveBeenCalled();
      }
    });
    it('updates the list of players displayed in response to playerAliveChanged events', async () => {
      render(<MafiaBoard gameAreaController={gameAreaController} />);
      gameAreaController.mockPlayersAlive = ['player1', 'player2', 'player3'];
      act(() => {
        gameAreaController.emit('playerAliveChanged', gameAreaController.mockPlayersAlive);
      });
      await checkBoard({});
      gameAreaController.mockPlayersAlive = ['player1', 'player3'];
      act(() => {
        gameAreaController.emit('playerAliveChanged', gameAreaController.mockPlayersAlive);
      });
      await checkBoard({});
    });
  });
  describe('[T3.2] When playing the game', () => {
    beforeEach(() => {
      gameAreaController.mockIsPlayer = true;
      gameAreaController.mockIsPlayerTurn = true;
    });
    it("enables cells when it is the player's turn", async () => {
      render(<MafiaBoard gameAreaController={gameAreaController} />);
      await checkBoard({ clickable: true });
      gameAreaController.mockIsPlayerTurn = false;
      act(() => {
        gameAreaController.emit('turnChanged', gameAreaController.mockIsPlayerTurn);
      });
      await checkBoard({ clickable: false });
    });
    it('makes a move when a player is clicked', async () => {
      render(<MafiaBoard gameAreaController={gameAreaController} />);
      await checkBoard({ clickable: true, checkMakeMove: true });
    });
    it('displays an error toast when an invalid move is made', async () => {
      render(<MafiaBoard gameAreaController={gameAreaController} />);
      await checkBoard({ clickable: true, checkMakeMove: true, checkToast: true });
    });
    it('updates the board in response to boardChanged events', async () => {
      render(<MafiaBoard gameAreaController={gameAreaController} />);
      await checkBoard({ clickable: true });
      gameAreaController.mockPlayersAlive = ['player1', 'player2', 'player3'];
      act(() => {
        gameAreaController.emit('playerAliveChanged', gameAreaController.mockPlayersAlive);
      });
      await checkBoard({ clickable: true });
    });
    it("disables cells when it is not the player's turn", async () => {
      render(<MafiaBoard gameAreaController={gameAreaController} />);
      await checkBoard({ clickable: true });
      gameAreaController.mockIsPlayerTurn = false;
      act(() => {
        gameAreaController.emit('turnChanged', gameAreaController.mockIsPlayerTurn);
      });
      await checkBoard({ clickable: false });
    });
  });
});

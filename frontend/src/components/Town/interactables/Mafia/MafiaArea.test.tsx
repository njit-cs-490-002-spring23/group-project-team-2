import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { mock, mockReset } from 'jest-mock-extended';
import React from 'react';
import { nanoid } from 'nanoid';
import { act } from 'react-dom/test-utils';
import MafiaAreaController from '../../../../classes/interactable/MafiaAreaController';
import PlayerController from '../../../../classes/PlayerController';
import TownController, * as TownControllerHooks from '../../../../classes/TownController';
import TownControllerContext from '../../../../contexts/TownControllerContext';
import {
  GameArea,
  GameResult,
  GameStatus,
  PlayerLocation,
  MafiaGameState,
  TimeOfDay,
} from '../../../../types/CoveyTownSocket';
import PhaserGameArea from '../GameArea';
import MafiaAreaWrapper from './MafiaArea';
import * as MafiaBoard from './MafiaBoard';

const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  const mockUseToast = () => mockToast;
  return {
    ...ui,
    useToast: mockUseToast,
  };
});
const mockGameArea = mock<PhaserGameArea>();
mockGameArea.getData.mockReturnValue('Mafia');
jest.spyOn(TownControllerHooks, 'useInteractable').mockReturnValue(mockGameArea);
const useInteractableAreaControllerSpy = jest.spyOn(
  TownControllerHooks,
  'useInteractableAreaController',
);

const boardComponentSpy = jest.spyOn(MafiaBoard, 'default');
boardComponentSpy.mockReturnValue(<div data-testid='board' />);

const randomLocation = (): PlayerLocation => ({
  moving: Math.random() < 0.5,
  rotation: 'front',
  x: Math.random() * 1000,
  y: Math.random() * 1000,
});

class MockMafiaAreaController extends MafiaAreaController {
  makeMove = jest.fn();

  joinGame = jest.fn();

  mockBoard: string[] = ['player1', 'player2', 'player3', 'player4', 'player5', 'player6'];

  mockIsPlayer = false;

  mockIsPlayerTurn = false;

  mockObservers: PlayerController[] = [];

  mockMoveCount = 0;

  mockWinners: PlayerController[] | undefined = undefined;

  mockWinnerTeam: 'CIVILIANS_TEAM' | 'MAFIAS_TEAM' | undefined = undefined;

  mockPhase: TimeOfDay | undefined = undefined;

  mockStatus: GameStatus = 'WAITING_TO_START';

  mockPolice: PlayerController | undefined = undefined;

  mockDoctor: PlayerController | undefined = undefined;

  mockMafias: PlayerController[] | undefined = undefined;

  mockVillagers: PlayerController[] | undefined = undefined;

  mockRole: 'Mafia' | 'Doctor' | 'Police' | 'Villager' | undefined = undefined;

  mockTeam: 'CIVILIANS_TEAM' | 'MAFIAS_TEAM' | undefined = undefined;

  mockCurrentGame: GameArea<MafiaGameState> | undefined = undefined;

  mockIsActive = false;

  mockRound: number | undefined = undefined;

  mockHistory: GameResult[] = [];

  public constructor() {
    super(nanoid(), mock<GameArea<MafiaGameState>>(), mock<TownController>());
  }

  get board(): string[] {
    throw new Error('Method should not be called within this component.');
  }

  get history(): GameResult[] {
    return this.mockHistory;
  }

  get isPlayerTurn() {
    return this.mockIsPlayerTurn;
  }

  get police(): PlayerController | undefined {
    return this.mockPolice;
  }

  get doctor(): PlayerController | undefined {
    return this.mockDoctor;
  }

  get mafias(): PlayerController[] | undefined {
    return this.mockMafias;
  }

  get villagers(): PlayerController[] | undefined {
    return this.mockVillagers;
  }

  get observers(): PlayerController[] {
    return this.mockObservers;
  }

  get moveCount(): number {
    return this.mockMoveCount;
  }

  get round(): number | undefined {
    return this.mockRound;
  }

  get winner(): PlayerController[] | undefined {
    return this.mockWinners;
  }

  get winnerTeam(): 'CIVILIANS_TEAM' | 'MAFIAS_TEAM' | undefined {
    return this.mockWinnerTeam;
  }

  get currentPhase(): TimeOfDay | undefined {
    return this.mockPhase;
  }

  get status(): GameStatus {
    return this.mockStatus;
  }

  get isPlayer() {
    return this.mockIsPlayer;
  }

  public isActive(): boolean {
    return this.mockIsActive;
  }

  public mockReset() {
    this.mockBoard = ['player1', 'player2', 'player3', 'player4'];
    this.makeMove.mockReset();
  }
}
describe('[T2] MafiaArea', () => {
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

  let ourPlayer: PlayerController;
  const townController = mock<TownController>();
  Object.defineProperty(townController, 'ourPlayer', { get: () => ourPlayer });
  let gameAreaController = new MockMafiaAreaController();
  let joinGameResolve: () => void;
  let joinGameReject: (err: Error) => void;

  function renderMafiaArea() {
    return render(
      <ChakraProvider>
        <TownControllerContext.Provider value={townController}>
          <MafiaAreaWrapper />
        </TownControllerContext.Provider>
      </ChakraProvider>,
    );
  }
  beforeEach(() => {
    ourPlayer = new PlayerController('player x', 'player x', randomLocation());
    mockGameArea.name = nanoid();
    mockReset(townController);
    gameAreaController.mockReset();
    useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
    mockToast.mockClear();
    gameAreaController.joinGame.mockReset();
    gameAreaController.makeMove.mockReset();

    gameAreaController.joinGame.mockImplementation(
      () =>
        new Promise<void>((resolve, reject) => {
          joinGameResolve = resolve;
          joinGameReject = reject;
        }),
    );
  });
  describe('[T2.1] Game update listeners', () => {
    it('Registers exactly two listeners when mounted: one for gameUpdated and one for gameEnd', () => {
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();

      renderMafiaArea();
      expect(addListenerSpy).toBeCalledTimes(2);
      expect(addListenerSpy).toHaveBeenCalledWith('gameUpdated', expect.any(Function));
      expect(addListenerSpy).toHaveBeenCalledWith('gameEnd', expect.any(Function));
    });
    it('Does not register listeners on every render', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderMafiaArea();
      expect(addListenerSpy).toBeCalledTimes(2);
      addListenerSpy.mockClear();

      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <MafiaAreaWrapper />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );

      expect(addListenerSpy).not.toBeCalled();
      expect(removeListenerSpy).not.toBeCalled();
    });
    it('Removes the listeners when the component is unmounted', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderMafiaArea();
      expect(addListenerSpy).toBeCalledTimes(2);
      const addedListeners = addListenerSpy.mock.calls;
      const addedGameUpdateListener = addedListeners.find(call => call[0] === 'gameUpdated');
      const addedGameEndedListener = addedListeners.find(call => call[0] === 'gameEnd');
      expect(addedGameEndedListener).toBeDefined();
      expect(addedGameUpdateListener).toBeDefined();
      renderData.unmount();
      expect(removeListenerSpy).toBeCalledTimes(2);
      const removedListeners = removeListenerSpy.mock.calls;
      const removedGameUpdateListener = removedListeners.find(call => call[0] === 'gameUpdated');
      const removedGameEndedListener = removedListeners.find(call => call[0] === 'gameEnd');
      expect(removedGameUpdateListener).toEqual(addedGameUpdateListener);
      expect(removedGameEndedListener).toEqual(addedGameEndedListener);
    });
    it('Creates new listeners if the gameAreaController changes', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderMafiaArea();
      expect(addListenerSpy).toBeCalledTimes(2);

      gameAreaController = new MockMafiaAreaController();
      const removeListenerSpy2 = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy2 = jest.spyOn(gameAreaController, 'addListener');

      useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <MafiaAreaWrapper />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );
      expect(removeListenerSpy).toBeCalledTimes(2);

      expect(addListenerSpy2).toBeCalledTimes(2);
      expect(removeListenerSpy2).not.toBeCalled();
    });
  });
  describe('[T2.3] Join game button', () => {
    it('Is not shown when the player is in a not-yet-started game', () => {
      gameAreaController.mockStatus = 'WAITING_TO_START';
      gameAreaController.mockDoctor = ourPlayer;
      gameAreaController.mockIsPlayer = true;
      renderMafiaArea();
      expect(screen.queryByText('Join Game')).not.toBeInTheDocument();
    });
    it('Is not shown if the game is in progress', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockDoctor = new PlayerController(
        'player Doctor',
        'player Doctor',
        randomLocation(),
      );
      gameAreaController.mockPolice = new PlayerController(
        'player Police',
        'player Police',
        randomLocation(),
      );
      gameAreaController.mockMafias = [
        new PlayerController('mafia1', 'mafia1', randomLocation()),
        new PlayerController('mafia2', 'mafia2', randomLocation()),
      ];
      gameAreaController.mockVillagers = [
        new PlayerController('villager1', 'villager1', randomLocation()),
        new PlayerController('villager2', 'villager2', randomLocation()),
      ];
      gameAreaController.mockIsPlayer = false;
      renderMafiaArea();
      expect(screen.queryByText('Join Game')).not.toBeInTheDocument();
    });
    it('Is enabled when the player is not in a game and the game is not in progress', () => {
      gameAreaController.mockStatus = 'WAITING_TO_START';
      gameAreaController.mockDoctor = undefined;
      gameAreaController.mockMafias = undefined;
      gameAreaController.mockVillagers = undefined;
      gameAreaController.mockPolice = new PlayerController(
        'player Police',
        'player Police',
        randomLocation(),
      );
      gameAreaController.mockIsPlayer = false;
      renderMafiaArea();
      expect(screen.queryByText('Join Game')).toBeInTheDocument();
    });
    describe('When clicked', () => {
      it('Calls joinGame on the gameAreaController', () => {
        gameAreaController.mockStatus = 'WAITING_TO_START';
        gameAreaController.mockIsPlayer = false;
        renderMafiaArea();
        const button = screen.getByText('Join Game');
        fireEvent.click(button);
        expect(gameAreaController.joinGame).toBeCalled();
      });
      it('Displays a toast with the error message if there is an error joining the game', async () => {
        gameAreaController.mockStatus = 'WAITING_TO_START';
        gameAreaController.mockIsPlayer = false;
        const errorMessage = nanoid();
        renderMafiaArea();
        const button = screen.getByText('Join Game');
        fireEvent.click(button);
        expect(gameAreaController.joinGame).toBeCalled();
        act(() => {
          joinGameReject(new Error(errorMessage));
        });
        await waitFor(() => {
          expect(mockToast).toBeCalledWith(
            expect.objectContaining({
              description: `Error: ${errorMessage}`,
              status: 'error',
            }),
          );
        });
      });

      it('Is disabled and set to loading when the player is joining a game', async () => {
        gameAreaController.mockStatus = 'WAITING_TO_START';
        gameAreaController.mockIsPlayer = false;
        renderMafiaArea();
        const button = screen.getByText('Join Game');
        expect(button).toBeEnabled();
        expect(within(button).queryByText('Loading...')).not.toBeInTheDocument();
        fireEvent.click(button);
        expect(gameAreaController.joinGame).toBeCalled();
        expect(button).toBeDisabled();
        expect(within(button).queryByText('Loading...')).toBeInTheDocument();
        act(() => {
          joinGameResolve();
        });
        await waitFor(() => expect(button).toBeEnabled());
        expect(within(button).queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
    it('Adds the display of the button when a game becomes possible to join', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockDoctor = new PlayerController(
        'player Doctor',
        'player Doctor',
        randomLocation(),
      );
      gameAreaController.mockPolice = new PlayerController(
        'player Police',
        'player Police',
        randomLocation(),
      );
      gameAreaController.mockMafias = [
        new PlayerController('mafia1', 'mafia1', randomLocation()),
        new PlayerController('mafia2', 'mafia2', randomLocation()),
      ];
      gameAreaController.mockVillagers = [
        new PlayerController('villager1', 'villager1', randomLocation()),
        new PlayerController('villager2', 'villager2', randomLocation()),
      ];
      renderMafiaArea();
      expect(screen.queryByText('Join Game')).not.toBeInTheDocument();
      act(() => {
        gameAreaController.mockStatus = 'OVER';
        gameAreaController.emit('gameUpdated');
      });
      expect(screen.queryByText('Join Game')).toBeInTheDocument();
    });
    it('Removes the display of the button when a game becomes no longer possible to join', () => {
      gameAreaController.mockStatus = 'WAITING_TO_START';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockDoctor = undefined;
      gameAreaController.mockPolice = new PlayerController(
        'player Police',
        'player Police',
        randomLocation(),
      );
      gameAreaController.mockMafias = [
        new PlayerController('mafia1', 'mafia1', randomLocation()),
        new PlayerController('mafia2', 'mafia2', randomLocation()),
      ];
      gameAreaController.mockVillagers = [
        new PlayerController('villager1', 'villager1', randomLocation()),
        new PlayerController('villager2', 'villager2', randomLocation()),
      ];
      renderMafiaArea();
      expect(screen.queryByText('Join Game')).toBeInTheDocument();
      act(() => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockDoctor = new PlayerController(
          'player Doctor',
          'player Doctor',
          randomLocation(),
        );
        gameAreaController.emit('gameUpdated');
      });
      expect(screen.queryByText('Join Game')).not.toBeInTheDocument();
    });
  });
  describe('[T2.4] Rendering the current observers', () => {
    beforeEach(() => {
      gameAreaController.mockObservers = [
        new PlayerController('player 1', 'player 1', randomLocation()),
        new PlayerController('player 2', 'player 2', randomLocation()),
        new PlayerController('player 3', 'player 3', randomLocation()),
      ];
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockDoctor = new PlayerController(
        'player Doctor',
        'player Doctor',
        randomLocation(),
      );
      gameAreaController.mockPolice = new PlayerController(
        'player Police',
        'player Police',
        randomLocation(),
      );
      gameAreaController.mockMafias = [
        new PlayerController('mafia1', 'mafia1', randomLocation()),
        new PlayerController('mafia2', 'mafia2', randomLocation()),
      ];
      gameAreaController.mockVillagers = [
        new PlayerController('villager1', 'villager1', randomLocation()),
        new PlayerController('villager2', 'villager2', randomLocation()),
      ];
    });
    it('Displays the correct observers when the component is mounted', () => {
      renderMafiaArea();
      const observerList = screen.getByLabelText('list of observers in the game');
      const observerItems = observerList.querySelectorAll('li');
      expect(observerItems).toHaveLength(gameAreaController.mockObservers.length);
      for (let i = 0; i < observerItems.length; i++) {
        expect(observerItems[i]).toHaveTextContent(gameAreaController.mockObservers[i].userName);
      }
    });
    it('Displays the correct observers when the game is updated', () => {
      renderMafiaArea();
      act(() => {
        gameAreaController.mockObservers = [
          new PlayerController('player 1', 'player 1', randomLocation()),
          new PlayerController('player 2', 'player 2', randomLocation()),
          new PlayerController('player 3', 'player 3', randomLocation()),
          new PlayerController('player 4', 'player 4', randomLocation()),
        ];
        gameAreaController.emit('gameUpdated');
      });
      const observerList = screen.getByLabelText('list of observers in the game');
      const observerItems = observerList.querySelectorAll('li');
      expect(observerItems).toHaveLength(gameAreaController.mockObservers.length);
      for (let i = 0; i < observerItems.length; i++) {
        expect(observerItems[i]).toHaveTextContent(gameAreaController.mockObservers[i].userName);
      }
    });
  });
  describe('[T2.6] Game status text', () => {
    it('Displays the correct text when the game is waiting to start', () => {
      gameAreaController.mockStatus = 'WAITING_TO_START';
      renderMafiaArea();
      expect(screen.getByText('Game not yet started', { exact: false })).toBeInTheDocument();
    });
    it('Displays the correct text when the game is in progress', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockPhase = 'Day';
      renderMafiaArea();
      expect(screen.getByText('Game in progress', { exact: false })).toBeInTheDocument();
    });
    it('Displays the correct text when the game is over', () => {
      gameAreaController.mockStatus = 'OVER';
      renderMafiaArea();
      expect(screen.getByText('Game over', { exact: false })).toBeInTheDocument();
    });

    describe('When a game is in progress', () => {
      beforeEach(() => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockDoctor = ourPlayer;
        gameAreaController.mockPolice = new PlayerController(
          'player Police',
          'player Police',
          randomLocation(),
        );
        gameAreaController.mockMafias = [
          new PlayerController('mafia1', 'mafia1', randomLocation()),
          new PlayerController('mafia2', 'mafia2', randomLocation()),
        ];
        gameAreaController.mockVillagers = [
          new PlayerController('villager1', 'villager1', randomLocation()),
          new PlayerController('villager2', 'villager2', randomLocation()),
        ];
      });
      it('Displays a message "Game in progress, Day Stage, and indicates whose turn it is when it is our turn', () => {
        gameAreaController.mockPhase = 'Day';
        gameAreaController.mockRound = 1;
        renderMafiaArea();
        expect(
          screen.getByText(`Game in progress. Day undefined, No Votes on First Day`, {
            exact: false,
          }),
        ).toBeInTheDocument();
      });
      it('Displays a message "Game in progress, Night Stage, and indicates whose turn it is when it is the other player\'s turn', () => {
        act(() => {
          gameAreaController.mockPhase = 'Night';
          gameAreaController.mockRound = 1;
          gameAreaController.emit('gameUpdated');
        });
        renderMafiaArea();
        expect(screen.getByText(`Game in progress. Night`, { exact: false })).toBeInTheDocument();
      });
      it('Updates the whose turn it is when the game is updated', () => {
        renderMafiaArea();
        expect(screen.getByText(`Game in progress.`, { exact: false })).toBeInTheDocument();
        act(() => {
          gameAreaController.mockPhase = 'Night';
          gameAreaController.emit('gameUpdated');
        });
        expect(
          screen.getByText(`Game in progress. Night`, {
            exact: false,
          }),
        ).toBeInTheDocument();
      });
    });
  });
  it('Updates the game status text when the game is updated', () => {
    gameAreaController.mockStatus = 'WAITING_TO_START';
    renderMafiaArea();
    expect(screen.getByText('Game not yet started', { exact: false })).toBeInTheDocument();
    act(() => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockPhase = 'Day';
      gameAreaController.emit('gameUpdated');
    });
    expect(screen.getByText('Game in progress', { exact: false })).toBeInTheDocument();
    act(() => {
      gameAreaController.mockStatus = 'OVER';
      gameAreaController.emit('gameUpdated');
    });
    expect(screen.getByText('Game over', { exact: false })).toBeInTheDocument();
  });
  describe('When the game ends', () => {
    it('Displays a toast with the loser', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockDoctor = ourPlayer;
      gameAreaController.mockTeam = 'MAFIAS_TEAM';
      gameAreaController.mockPolice = new PlayerController(
        'player Police',
        'player Police',
        randomLocation(),
      );
      gameAreaController.mockMafias = [
        new PlayerController('mafia1', 'mafia1', randomLocation()),
        new PlayerController('mafia2', 'mafia2', randomLocation()),
      ];
      gameAreaController.mockVillagers = [
        new PlayerController('villager1', 'villager1', randomLocation()),
        new PlayerController('villager2', 'villager2', randomLocation()),
      ];
      gameAreaController.mockWinners = [];
      gameAreaController.mockWinnerTeam = 'MAFIAS_TEAM';
      renderMafiaArea();
      act(() => {
        gameAreaController.emit('gameEnd');
      });
      expect(mockToast).toBeCalledWith(
        expect.objectContaining({
          description: `You lost, ${gameAreaController.mockTeam} won!`,
        }),
      );
    });
  });
});

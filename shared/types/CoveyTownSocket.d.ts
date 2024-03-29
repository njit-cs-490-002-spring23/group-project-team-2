
// Interactable interface and Interactable command Code Taken from IP2
export type TownJoinResponse = {
  /** Unique ID that represents this player * */
  userID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  sessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this town * */
  currentPlayers: Player[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;
  /** Current state of interactables in this town */
  interactables: TypedInteractable[];
}
export type TownSettingsUpdate = {
  friendlyName?: string;
  isPubliclyListed?: boolean;
}

export type InteractableType = 'ConversationArea' | 'ViewingArea' | 'MafiaArea';
export interface Interactable {
  type: InteractableType;
  id: InteractableID;
  occupants: PlayerID[];
}

export type Direction = 'front' | 'back' | 'left' | 'right';
export type PlayerID = string;
export interface Player {
  id: PlayerID;
  userName: string;
  location: PlayerLocation;
};

export type XY = { x: number, y: number };

export interface PlayerLocation {
  /* The CENTER x coordinate of this player's location */
  x: number;
  /* The CENTER y coordinate of this player's location */
  y: number;
  /** @enum {string} */
  rotation: Direction;
  moving: boolean;
  interactableID?: string;
};

export type ChatMessage = {
  author: string;
  sid: string;
  body: string;
  dateCreated: Date;
};

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface ConversationArea extends Interactable {
  topic?: string;
};

export interface ViewingArea extends Interactable {
  video?: string;
  isPlaying: boolean;
  elapsedTimeSec: number;
}


/* Game */
export type GameStatus = 'IN_PROGRESS' | 'WAITING_TO_START' | 'OVER';
/**
 * Base type for the state of a game
 */
export interface GameState {
  status: GameStatus;
}

export type Teams = 'CIVILIANS_TEAM' | 'MAFIAS_TEAM';
/**
 * Type for the state of a game that can be won
 */
export interface WinnableGameState extends GameState {
  winners?: PlayerID[];
  winnerTeam?: Teams;
}

/**
 * Base type for a move in a game. Implementers should also extend MoveType
 * @see MoveType
 */
export interface GameMove<MoveType> {
  playerID: PlayerID;
  gameID: GameInstanceID;
  move: MoveType;
}

/**
 * Type for a move in Mafia Game
 */
export interface MafiaMove {
  playerVoting: PlayerID;
  playerVoted: PlayerID;
}

/**
 * Type for the state of a Mafia game
 * The state of the game is represented as a list of moves, and the playerIDs of the players (2 villagers, 2 mafia, one police, one doctor)
 * When player join, they will be assign to the roles randonly
 */
export type PlayerStatus = 'Active' | 'Spectator' | 'Left';

export type PlayerState = {
  id: PlayerID;
  status: PlayerStatus;
}

export type TimeOfDay = 'Day' | 'Night' | undefined;
export interface MafiaGameState extends WinnableGameState {
  moves: ReadonlyArray<MafiaMove>;
  villagers?: PlayerState[];
  mafia?: PlayerState[];
  police?: PlayerState;
  doctor?: PlayerState;
  phase?: TimeOfDay;
  round?: number;
  investigation?: PlayerID[];
  banPlayers?: PlayerID[];
}

export type InteractableID = string;
export type GameInstanceID = string;

/**
 * Type for the result of a game
 */
export interface GameResult {
  gameID: GameInstanceID;
  scores: { [playerName: string]: number };
}

/**
 * Base type for an *instance* of a game. An instance of a game
 * consists of the present state of the game (which can change over time),
 * the players in the game, and the result of the game
 * @see GameState
 */
export interface GameInstance<T extends GameState> {
  state: T;
  id: GameInstanceID;
  players: PlayerID[];
  result?: GameResult;
}

/**
 * Base type for an area that can host a game
 * @see GameInstance
 */
export interface GameArea<T extends GameState> extends Interactable {
  game: GameInstance<T> | undefined;
  history: GameResult[];
}

export type CommandID = string;

/**
 * Base type for a command that can be sent to an interactable.
 * This type is used only by the client/server interface, which decorates
 * an @see InteractableCommand with a commandID and interactableID
 */
interface InteractableCommandBase {
  /**
   * A unique ID for this command. This ID is used to match a command against a response
   */
  commandID: CommandID;
  /**
   * The ID of the interactable that this command is being sent to
   */
  interactableID: InteractableID;
  /**
   * The type of this command
   */
  type: string;
}

export type InteractableCommand =  ViewingAreaUpdateCommand | JoinGameCommand | GameMoveCommand<MafiaMove> | LeaveGameCommand | CountVotesCommand | StartGameCommand;
export interface ViewingAreaUpdateCommand  {
  type: 'ViewingAreaUpdate';
  update: ViewingArea;
}
export interface JoinGameCommand {
  type: 'JoinGame';
}
export interface LeaveGameCommand {
  type: 'LeaveGame';
  gameID: GameInstanceID;
}
export interface GameMoveCommand<MoveType> {
  type: 'GameMove';
  gameID: GameInstanceID;
  move: MoveType;
}
export interface StartGameCommand {
  type: 'StartGame';
}
export interface CountVotesCommand {
  type: 'countVotes';
  gameID: GameInstanceID;
}
export type InteractableCommandReturnType<CommandType extends InteractableCommand> = 
  CommandType extends StartGameCommand ? undefined:
  CommandType extends JoinGameCommand ? { gameID: string}:
  CommandType extends ViewingAreaUpdateCommand ? undefined :
  CommandType extends GameMoveCommand<MafiaMove> ? undefined :
  CommandType extends CountVotesCommand ? undefined :
  CommandType extends LeaveGameCommand ? undefined :
  never;

export type InteractableCommandResponse<MessageType> = {
  commandID: CommandID;
  interactableID: InteractableID;
  error?: string;
  payload?: InteractableCommandResponseMap[MessageType];
}

export interface ServerToClientEvents {
  playerMoved: (movedPlayer: Player) => void;
  playerDisconnect: (disconnectedPlayer: Player) => void;
  playerJoined: (newPlayer: Player) => void;
  initialize: (initialData: TownJoinResponse) => void;
  townSettingsUpdated: (update: TownSettingsUpdate) => void;
  townClosing: () => void;
  chatMessage: (message: ChatMessage) => void;
  interactableUpdate: (interactable: Interactable) => void;
  commandResponse: (response: InteractableCommandResponse) => void;
}

export interface ClientToServerEvents {
  chatMessage: (message: ChatMessage) => void;
  playerMovement: (movementData: PlayerLocation) => void;
  interactableUpdate: (update: Interactable) => void;
  interactableCommand: (command: InteractableCommand & InteractableCommandBase) => void;
}
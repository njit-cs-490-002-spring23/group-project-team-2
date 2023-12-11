import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Container,
  Heading,
  List,
  ListItem,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import React, { useCallback, useEffect, useState } from 'react';
import MafiaAreaController from '../../../../classes/interactable/MafiaAreaController';
import PlayerController from '../../../../classes/PlayerController';
import useTownController from '../../../../hooks/useTownController';
import { GameStatus, InteractableID } from '../../../../types/CoveyTownSocket';
import GameAreaInteractable from '../GameArea';
import MafiaBoard from './MafiaBoard';

const REQUIRED_MIN_PLAYERS = 6;
const MAX_PLAYERS = 10;

function gameStatusMessage(controller: MafiaAreaController): string {
  if (controller.status === 'IN_PROGRESS') {
    const phase = controller.currentPhase;
    const isPlayerTurn = controller.isPlayerTurn;

    if (phase === 'Day') {
      return `Game in progress, Day Stage, its your turn to vote`;
    } else {
      return `Game in progress, Night Stage, ${
        isPlayerTurn ? 'perform your night action' : 'waiting for the night to end'
      }`;
    }
  } else if (controller.status === 'WAITING_TO_START') {
    return 'Game not yet started.';
  } else if (controller.status === 'OVER') {
    return 'Game over.';
  } else {
    return 'Unknown game status.';
  }
}

function MafiaArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const gameAreaController = useInteractableAreaController<MafiaAreaController>(interactableID);
  const townController = useTownController();

  const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);
  const [observers, setObservers] = useState<PlayerController[]>(gameAreaController.observers);
  const [joiningGame, setJoiningGame] = useState(false);
  const [players, setPlayers] = useState<PlayerController[]>();
  const [canStartGame, setCanStartGame] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const updateGameState = () => {
      setGameStatus(gameAreaController.status || 'WAITING_TO_START');
      setObservers(gameAreaController.observers);
      const allPlayers = [];
      if (gameAreaController.police) {
        allPlayers.push(gameAreaController.police);
      }
      if (gameAreaController.doctor) {
        allPlayers.push(gameAreaController.doctor);
      }
      if (gameAreaController.mafias) {
        allPlayers.push(...gameAreaController.mafias);
      }
      if (gameAreaController.villagers) {
        allPlayers.push(...gameAreaController.villagers);
      }
      setPlayers(gameAreaController.players);
      setCanStartGame(
        allPlayers.length >= REQUIRED_MIN_PLAYERS && allPlayers.length <= MAX_PLAYERS,
      );
    };

    gameAreaController.addListener('gameUpdated', updateGameState);
    const onGameEnd = () => {
      const winnerTeam = gameAreaController.winnerTeam;
      const isOurPlayerAWinner = gameAreaController.winners?.includes(townController.ourPlayer);
      if (isOurPlayerAWinner) {
        toast({
          title: 'Game over',
          description: `Congratulations, your ${winnerTeam} won!`,
          status: 'success',
        });
      } else {
        toast({
          title: 'Game over',
          description: `You lost, ${winnerTeam} won!`,
          status: 'success',
        });
      }
    };
    gameAreaController.addListener('gameEnd', onGameEnd);
    return () => {
      gameAreaController.removeListener('gameEnd', onGameEnd);
      gameAreaController.removeListener('gameUpdated', updateGameState);
    };
  }, [townController, gameAreaController, toast]);

  let joinGame = <></>;
  let startGame = <></>;
  if (
    (gameStatus === 'WAITING_TO_START' && !gameAreaController.isPlayer) ||
    gameStatus === 'OVER'
  ) {
    joinGame = (
      <Button
        onClick={async () => {
          setJoiningGame(true);
          try {
            await gameAreaController.joinGame();
          } catch (error) {
            toast({
              title: 'Error',
              description: (error as Error).toString(),
              status: 'error',
            });
          }
          setJoiningGame(false);
        }}
        isLoading={joiningGame}
        disabled={joiningGame}>
        Join Game
      </Button>
    );
  }
  if (
    gameStatus === 'WAITING_TO_START' &&
    gameAreaController.isPlayer &&
    gameAreaController.firstPlayer()
  ) {
    startGame = (
      <Button
        onClick={async () => {
          setCanStartGame(true);
          try {
            await gameAreaController.startGame();
          } catch (error) {
            toast({
              title: 'Error',
              description: (error as Error).toString(),
              status: 'error',
            });
          }
          setCanStartGame(false);
        }}
        isLoading={canStartGame}
        disabled={canStartGame}>
        Start Game
      </Button>
    );
  }

  return (
    <Container>
      <Accordion allowToggle>
        <AccordionItem>
          <Heading as='h3'>
            <AccordionButton>
              <Box as='span' flex='1' textAlign='left'>
                Current Observers
                <AccordionIcon />
              </Box>
            </AccordionButton>
          </Heading>
          <AccordionPanel>
            {/*A list of players' in game plus their death/alive status*/}
            <List aria-label='list of observers in the game'>
              {observers.map(player => {
                return <ListItem key={player.id}>{player.userName}</ListItem>;
              })}
            </List>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      {/*A message indicating the current game status*/}
      <b>
        {gameStatusMessage(gameAreaController)}. {joinGame} {startGame}
      </b>
      <List aria-label='list of players in the game'>
        {players && players.length > 0 ? (
          players.map((player, index) => <ListItem key={index}>{player.userName}</ListItem>)
        ) : (
          <ListItem>(No player yet!)</ListItem>
        )}
      </List>
      <MafiaBoard gameAreaController={gameAreaController} />
    </Container>
  );
}

export default function MafiaAreaWrapper(): JSX.Element {
  const gameArea = useInteractable<GameAreaInteractable>('gameArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (gameArea) {
      townController.unPause();
      townController.interactEnd(gameArea);
      const controller = townController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [townController, gameArea]);
  if (gameArea && gameArea.getData('type') === 'Mafia') {
    townController.pause();
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{gameArea.name}</ModalHeader>
          <ModalCloseButton />
          <MafiaArea interactableID={gameArea.name} />;
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}

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
import { GameStatus, InteractableID, PlayerID } from '../../../../types/CoveyTownSocket';
import GameAreaInteractable from '../GameArea';
import MafiaBoard from './MafiaBoard';

function gameStatusMessage(controller: MafiaAreaController): string {
  if (controller.status === 'IN_PROGRESS') {
    const phase = controller.currentPhase;
    const isPlayerTurn = controller.isPlayerTurn;

    if (phase === 'Day') {
      return `Mafia game in progress, Day Stage, ${
        isPlayerTurn ? "it's your turn to vote" : 'waiting for others to vote'
      }`;
    } else {
      return `Mafia game in progress, Night Stage, ${
        isPlayerTurn ? 'perform your night action' : 'waiting for the night to end'
      }`;
    }
  } else if (controller.status === 'WAITING_TO_START') {
    return 'Game not yet started. Waiting for more players.';
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
  const [players, setPlayers] = useState<PlayerID[]>(gameAreaController.playersAlive);
  const toast = useToast();

  useEffect(() => {
    const updateGameState = () => {
      setGameStatus(gameAreaController.status || 'WAITING_TO_START');
      setObservers(gameAreaController.observers);
      setPlayers(gameAreaController.playersAlive);
    };

    gameAreaController.addListener('gameUpdated', updateGameState);
    const onGameEnd = () => {
      const winnerTeam = gameAreaController.winnerTeam;
      const isOurPlayerAWinner = gameAreaController.winners.includes(townController.ourPlayer);
      if (isOurPlayerAWinner) {
        toast({
          title: 'Game over',
          description: `Congratulations, your team (${winnerTeam}) won!`,
          status: 'success',
        });
      } else {
        toast({
          title: 'Game over',
          description: `You lost, Team (${winnerTeam}) won!`,
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
  if (gameStatus === 'WAITING_TO_START' || gameStatus === 'OVER') {
    joinGame = (
      <Button
        onClick={async () => {
          setJoiningGame(true);
          try {
            await gameAreaController.joinGame();
          } catch (err) {
            toast({
              title: 'Error',
              description: 'Error joining game',
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
        {gameStatusMessage(gameAreaController)}. {joinGame}
      </b>
      <List aria-label='list of players in the game'>
        {players.map((player, index) => (
          <ListItem key={index}>{player}</ListItem>
        ))}
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
      townController.interactEnd(gameArea);
      const controller = townController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [townController, gameArea]);
  if (gameArea && gameArea.getData('type') === 'TicTacToe') {
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

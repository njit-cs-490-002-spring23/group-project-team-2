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
import { PlayerID } from '../../../../types/CoveyTownSocket';

const REQUIRED_MIN_PLAYERS = 6;
const MAX_PLAYERS = 10;

function gameStatusMessage(controller: MafiaAreaController): string {
  if (controller.status === 'IN_PROGRESS') {
    const round = controller.currentRound;
    const isPlayerTurn = controller.isPlayerTurn;
    const phase = controller.currentPhase;

    if (phase === 'Day') {
      return `Game in progress. Day ${round}, ${
        isPlayerTurn ? 'Vote Now' : 'No Votes on First Day'
      }`;
    } else if (phase === 'Night') {
      return `Game in progress. Night ${round}, ${
        isPlayerTurn ? 'perform your night action' : 'waiting for the night to end'
      }`;
    }
  } else if (controller.status === 'WAITING_TO_START') {
    return 'Game not yet started.';
  } else if (controller.status === 'OVER') {
    return 'Game over.';
  }
  return 'Unknown game status.';
}

function isPlayerAlive(controller: MafiaAreaController, id: PlayerID): string {
  const villagers = controller.villagersState;
  if (villagers) {
    const villagerPlayer = villagers.filter(villager => villager.id === id);
    if (villagerPlayer.length > 0) {
      return villagerPlayer[0].status;
    }
  }
  const mafias = controller.mafiasState;
  if (mafias) {
    const mafiaPlayer = mafias.filter(mafia => mafia.id === id);
    if (mafiaPlayer.length > 0) {
      return mafiaPlayer[0].status;
    }
  }
  const doctor = controller.doctorState;
  if (doctor) {
    if (doctor.id === id) {
      return doctor.status;
    }
  }
  const police = controller.policeState;
  if (police) {
    if (police.id === id) {
      return police.status;
    }
  }
  return 'No Status';
}

function getPlayerRole(controller: MafiaAreaController, id: PlayerID): string {
  const villagers = controller.villagersState;
  if (villagers && villagers.some(villager => villager.id === id)) {
    return ' (Village)';
  }
  const mafias = controller.mafiasState;
  if (mafias && mafias.some(mafia => mafia.id === id)) {
    return ' (Mafia)';
  }
  const doctor = controller.doctorState;
  if (doctor && doctor.id === id) {
    return ' (Doctor)';
  }
  const police = controller.policeState;
  if (police && police.id === id) {
    return ' (Police)';
  }
  return 'No Role';
}

function investigation(
  controller: MafiaAreaController,
  id: PlayerID,
  ourPlayer: PlayerID,
): string | undefined {
  if (ourPlayer !== controller.police?.id) {
    return undefined;
  }
  const policeInvestigation = controller.investigation;
  if (policeInvestigation && policeInvestigation.includes(id)) {
    return getPlayerRole(controller, id);
  }
  return undefined;
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
    gameStatus === 'OVER' ||
    (gameAreaController.checkPlayerListLeftStatus &&
      gameStatus === 'IN_PROGRESS' &&
      !gameAreaController.isPlayer)
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
          players.map((player, index) => (
            <ListItem key={index}>
              {player.userName}: {isPlayerAlive(gameAreaController, player.id)}
              {investigation(gameAreaController, player.id, townController.ourPlayer.id)}
            </ListItem>
          ))
        ) : (
          <ListItem></ListItem>
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

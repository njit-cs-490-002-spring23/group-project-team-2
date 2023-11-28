import { Text, Box, Button, chakra, Container, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import MafiaAreaController from '../../../../classes/interactable/MafiaAreaController';
import { PlayerID } from '../../../../types/CoveyTownSocket';
import { ChatArea } from './chat/ChatComponent';

export type MafiaGameProps = {
  gameAreaController: MafiaAreaController;
};

/**
 * A component that will render the mafia board, styled
 */

const StyledMafiaGameBoard = chakra(Container, {
  baseStyle: {
    display: 'flex',
    flexDirection: 'column',
    width: '500px',
    minHeight: '400px',
    padding: '20px',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'darkgray',
    borderRadius: '10px',
  },
});

/**
 * A component that will render a single player in the Mafia game, styledd
 */
const StyledMafiaPlayer = chakra(Button, {
  baseStyle: {
    justifyContent: 'left',
    alignItems: 'center',
    padding: '10px',
    width: 'auto',
    height: '80px',
    fontSize: '20px',
    fontWeight: 'bold',
    backgroundColor: 'black',
    color: 'white',
    borderRadius: '20px',
    _hover: {
      bg: 'gray',
    },
    _active: {
      bg: 'red',
    },
    _disabled: {
      opacity: 0.5,
    },
  },
});

/**
 * A component that will render the timer, styledd
 */
const StyledTimer = chakra(Text, {
  baseStyle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'black',
  },
});

export default function MafiaBoard({ gameAreaController }: MafiaGameProps): JSX.Element {
  const [players, setPlayers] = useState<PlayerID[]>(gameAreaController.playersAlive);
  const [currentPhase, setCurrentPhase] = useState(gameAreaController.currentPhase);
  const [isPlayerTurn, setIsPlayerTurn] = useState(gameAreaController.isPlayerTurn);
  const [timer, setTimer] = useState(30);
  const toast = useToast();

  useEffect(() => {
    setTimer(30);
  }, [currentPhase]);

  useEffect(() => {
    gameAreaController.addListener('turnChanged', setIsPlayerTurn);
    gameAreaController.addListener('playerAliveChanged', setPlayers);
    gameAreaController.addListener('phaseChanged', setCurrentPhase);
    return () => {
      gameAreaController.removeListener('turnChanged', setIsPlayerTurn);
      gameAreaController.removeListener('playerAliveChanged', setPlayers);
      gameAreaController.removeListener('phaseChanged', setCurrentPhase);
    };
  }, [gameAreaController]);
  return (
    <Box>
      <StyledMafiaGameBoard aria-label='Mafia Display'>
        <StyledTimer
          sx={{
            color: timer < 10 ? 'red' : 'black',
          }}>
          Time Left: {timer} seconds
        </StyledTimer>
        {players.map((player, index) => (
          <StyledMafiaPlayer
            key={index}
            onClick={async () => {
              try {
                await gameAreaController.makeMove(player as PlayerID);
              } catch (error) {
                toast({
                  title: 'Error',
                  description: 'Error Making Move',
                  status: 'error',
                });
              }
            }}
            disabled={!isPlayerTurn}>
            {gameAreaController.observers.find(p => p.id === player)?.userName}
          </StyledMafiaPlayer>
        ))}
      </StyledMafiaGameBoard>
      <ChatArea />
    </Box>
  );
}

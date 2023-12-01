/* eslint-disable @typescript-eslint/naming-convention */
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '50px 10px 10px',
    gap: '10px',
    width: 'auto',
    minHeight: '200px',
    background: 'darkgray',
    borderRadius: '10px',
    position: 'relative',
    top: '5px',
    right: '2px',
  },
});

/**
 * A component that will render a single player in the Mafia game, styledd
 */
const StyledMafiaPlayer = chakra(Button, {
  baseStyle: {
    justifyContent: 'left',
    alignItems: 'center',
    padding: '8px',
    width: 'auto',
    height: '70px',
    fontSize: '18px',
    fontWeight: 'bold',
    backgroundColor: 'lightgrey',
    color: 'white',
    borderRadius: '20px',
    _hover: {
      bg: 'grey',
    },
    _active: {
      bg: 'red',
    },
    _disabled: {
      opacity: 0.5,
    },
  },
});

// A component that will render the game timer, styled
const StyledTimer = chakra(Text, {
  baseStyle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'black',
    marginLeft: '8px',
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
    borderRadius: '5px',
    position: 'absolute',
    top: '10px',
    right: '10px',
  },
});

export default function MafiaBoard({ gameAreaController }: MafiaGameProps): JSX.Element {
  const [players, setPlayers] = useState<string[]>(gameAreaController.board);
  const [isPlayerTurn, setIsPlayerTurn] = useState(gameAreaController.isPlayerTurn);
  const [timer, setTimer] = useState(30);
  const toast = useToast();

  useEffect(() => {
    setTimer(30);
    const tick = () => {
      setTimer(prevTimer => (prevTimer > 0 ? prevTimer - 1 : 0));
    };
    const timerId = setInterval(tick, 1000);
    return () => clearInterval(timerId);
  }, [isPlayerTurn]);

  useEffect(() => {
    gameAreaController.addListener('turnChanged', setIsPlayerTurn);
    gameAreaController.addListener('boardChanged', setPlayers);
    return () => {
      gameAreaController.removeListener('turnChanged', setIsPlayerTurn);
      gameAreaController.removeListener('boardChanged', setPlayers);
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
        {players.map((player, index) => {
          return (
            <StyledMafiaPlayer
              key={index}
              onClick={async () => {
                try {
                  await gameAreaController.makeMove(player as PlayerID);
                } catch (error) {
                  toast({
                    title: 'Error',
                    description: (error as Error).toString(),
                    status: 'error',
                  });
                }
              }}
              disabled={!isPlayerTurn}
              aria-label={`Player ${index + 1}`}>
              {gameAreaController.observers.find(p => p.id === player)?.userName}
            </StyledMafiaPlayer>
          );
        })}
      </StyledMafiaGameBoard>
      <ChatArea />
    </Box>
  );
}

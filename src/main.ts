import Phaser from 'phaser';
import './styles.css';
import { gameSceneConfig } from './presentation/scenes/GameScene';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app root element');
}

new Phaser.Game(gameSceneConfig);

import List from './pages/List.js';
import Leaderboard from './pages/Leaderboard.js';
import Roulette from './pages/Roulette.js';
import Unlimited from "./pages/Unlimited.js";
import ULeaderboard from "./pages/ULeaderboard.js";

export default [
    { path: '/', component: List },
    { path: '/leaderboard', component: Leaderboard },
    { path: '/roulette', component: Roulette },
    { path: '/unlimited', component: Unlimited },
    { path: '/uleaderboard', component: ULeaderboard },
];

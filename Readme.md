# PureESBoard

PureESBoard is a.dashboard allowing you to watch over several services through widgets. 

## Available services !

PureESBoard is compatible with the followings services :

* [Steam](https://store.steampowered.com/)
* [Trello](https://trello.com/)
* [League of legends](https://eune.leagueoflegends.com/en/)
* [Github](https://github.com/)
* [OpenWeather](https://openweathermap.org/)

### Steam

| Widgets | Description | Requirements |
| ------ | --------- | ------ |
| Games list |  Allows you to see you owned games with the time passed on it.| refresh timer (int) |
| Friends list |  Allows you to see your friends status and th game they are playing.| refresh timer (int) |
| Game watcher | Allows you to watch a specific game and look at the friends connected to it.  |  refresh timer (int), game name (string) |

##### Requirements
Widgets are only available if your ESPureBoard account is linked to you steam account.

### Trello
| Widgets | Description | Requirements |
| ------ | --------- | ------ |
| Cards Lister |  Watch over your task on a specific board | refresh timer (int), board name (string) |

##### Requirements
Widgets are only available if your ESPureBoard account is linked to you trello account.

### League of legends
| Widgets | Description | Requirements |
| ------ | --------- | ------ |
| Rank watcher |  Watch a player rank and lp in real time.| refresh timer (int), region (enum), player name (string) |
| In-Game Watcher |  Watch a player status in real time.| refresh timer (int), region (enum), player name (string) |
##### Requirements
None.

### Github

| Widgets | Description | Requirements |
| ------ | --------- | ------ |
| Commit lister | Allows you see commits on a repository  | refresh timer (int), repo name (string) |

##### Requirements
Widgets are only available if your ESPureBoard account is linked to you github account.

### Openweather
| Widgets | Description | Requirements |
| ------ | --------- | ------ |
| Forecast Weather graph |  Forecast graph of the temperature and humidity.| refresh timer (int), city (string) |
| Weather of the day |  Display th weather and humidity of the day.| refresh timer (int), city (string) |

##### Requirements
None.

### Setup

##### Requirements
* [Docker](https://www.docker.com/)
* [docker-compose](https://docs.docker.com/compose/)

##### Installation          
```sh
$ docker-compose build
$ docker-compose up
```

# PureESBoard

## Introduction

**`PureESBoard`** is a dashboard allowing you to overwatch several services through widgets.

## Authors

- **`Nicolas Polomack`** (email: [**`nicolas.polomack@epitech.eu`**](mailto:nicolas.polomack@epitech.eu))
- **`Cédric Thomas`** (email: [**`cedric.thomas@epitech.eu`**](mailto:cedric.thomas@epitech.eu))

## Available services

PureESBoard integrates with the following services:

- [**`Steam`**](https://store.steampowered.com/)
- [**`Trello`**](https://trello.com/)
- [**`League of Legends`**](https://euw.leagueoflegends.com/)
- [**`Github`**](https://github.com/)
- [**`OpenWeather`**](https://openweathermap.org/)

### Steam

These widgets requires your account to be linked with a Steam account.

| Widgets | Description | Requires |
| ------ | --------- | ------ |
| Games list | Allows you to see you owned games with the time passed on it | Nothing |
| Friends list | Allows you to see your friends status and th game they are playing | Nothing |
| Game watcher | Allows you to watch for friends playing a specific game | Game name |

### Trello

These widgets requires your account to be linked with a Trello account.

| Widgets | Description | Requires |
| ------ | --------- | ------ |
| Cards Lister | List tasks assigned to you on a specific board | Board name |

### League of legends

| Widgets | Description | Requires |
| ------ | --------- | ------ |
| Rank watcher | Watch a summoner's rank and league points | Region, Summoner name |
| In-Game watcher | Watch a summoner's game status | Region, Summoner name |

### Github

These widgets requires your account to be linked with a GitHub account.

| Widgets | Description | Requires |
| ------ | --------- | ------ |
| Commits | Allows you see commits on a repository | Name, Author |

### OpenWeather
| Widgets | Description | Requires |
| ------ | --------- | ------ |
| Forecast weather | Displays the evolution of temperature and humidity over the next 5 days | City name |
| Current weather | Displays current weather data | City name |

## Setup

### Requirements
- [Docker](https://www.docker.com/)
- [Docker-Compose](https://docs.docker.com/compose/)

### Installation

Here are the two commands required to build and run the service:
```bash
docker-compose build
docker-compose up
```

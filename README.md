# jacksmhtools-client
Unofficial client for jack's mousehunt database

## Usage

```shell
jmht-cli <command> [options]

Commands:
  jmht-cli attr              compute attraction rate for setup
                                                           [aliases: attraction]
  jmht-cli id <type> <name>  get the id of item named "name"
  jmht-cli loot              display loot drops for setup
  jmht-cli pop               display mouse population for setup
                                                           [aliases: population]
  jmht-cli power [mouse]     compute mouse power stats

Options:
  --help         Show help                                             [boolean]
  --version      Show version number                                   [boolean]
  --verbose, -v                                                 [default: false]
  --mysql
```

### Attraction

Computes the attraction rate for specific setup, with correction for attraction bonus.

#### Example 

```shell
jmht-cli attr --vars.cheese.gilded --vars.location."town of gnawnia"
#{
#  "attraction": 0.8451512474057308,
#  "raw_attraction": 0.8875282376694548,
#  "sample": 3467
#}

```

### Loot

Loot drops for specific setup.

#### Example

```shell
jmht-cli loot --vars.cheese.undead\ emmental --vars.location.catacombs --vars.mouse."Zombot Unipire" --min_qty 1 --exclude "Cursed Gold"
#[
#  {
#    "id": 197,
#    "name": "King's Credit",
#    "chance": 1,
#    "total": 109,
#    "avgPerCatch": 1.4931506849315068,
#    "avgPerDrop": 1.4931506849315068,
#    "sample": 73
#  },
#  {
#    "id": 183,
#    "name": "Radioactive Sludge",
#    "chance": 0.410958904109589,
#    "total": 147,
#    "avgPerCatch": 2.0136986301369864,
#    "avgPerDrop": 4.9,
#    "sample": 73
#  }
#]
```

### Population

Mouse population for specific setup

#### Example

```shell
jmht-cli pop --vars.cheese.sb --vars.location.living\ garden
#[
#  {
#    "mouse": "Strawberry Hotcakes",
#    "attraction": 0.24369747899159663,
#    "seen": 290,
#    "sample": 1190
#  },
#  {
#    "mouse": "Thistle",
#    "attraction": 0.20336134453781513,
#    "seen": 242,
#    "sample": 1190
#  },
#  {
#    "mouse": "Bark",
#    "attraction": 0.16134453781512606,
#    "seen": 192,
#    "sample": 1190
#  },
#  {
#    "mouse": "Calalilly",
#    "attraction": 0.14705882352941177,
#    "seen": 175,
#    "sample": 1190
#  },
#  {
#    "mouse": "Shroom",
#    "attraction": 0.14369747899159663,
#    "seen": 171,
#    "sample": 1190
#  },
#  {
#    "mouse": "Camoflower",
#    "attraction": 0.06470588235294118,
#    "seen": 77,
#    "sample": 1190
#  },
#  {
#    "mouse": "Thirsty",
#    "attraction": 0.03613445378151261,
#    "seen": 43,
#    "sample": 1190
#  }
#]
```

### Power

Compute mouse power given power effectiveness and power types.

#### Example

```shell
jmht-cli power shadow\ stalker --forgotten --eff 0.5
#{
#  "mousePower": 28184,
#  "effectiveness": 0.5,
#  "empiricalCR": 0.04225279110778683,
#  "predictedCR": 0.04225196026439073,
#  "minPredictedLuck": 213,
#  "maxFtcLuck": 84,
#  "sample": 3371
#}
```

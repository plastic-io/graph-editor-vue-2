const adjectives = [
    "Aggressive",
    "Agreeable",
    "Ambitious",
    "Brave",
    "Calm",
    "Delightful",
    "Eager",
    "Faithful",
    "Gentle",
    "Happy",
    "Jolly",
    "Kind",
    "Lively",
    "Nice",
    "Obedient",
    "Polite",
    "Proud",
    "Silly",
    "Thankful",
    "Victorious",
    "Witty",
    "Wonderful",
    "Zealous",
    "Ancient",
    "Brief",
    "Early",
    "Fast",
    "Future",
    "Late",
    "Long",
    "Modern",
    "Old",
    "Old-fashioned",
    "Prehistoric",
    "Quick",
    "Rapid",
    "Short",
    "Slow",
    "Swift",
    "Young",
    "Attractive",
    "Bald",
    "Beautiful",
    "Chubby",
    "Clean",
    "Dazzling",
    "Drab",
    "Elegant",
    "Fancy",
    "Fit",
    "Flabby",
    "Glamorous",
    "Gorgeous",
    "Handsome",
    "Long",
    "Magnificent",
    "Muscular",
    "Plain",
    "Plump",
    "Quaint",
    "Scruffy",
    "Shapely",
    "Short",
    "Skinny",
    "Stocky",
    "Ugly",
    "Unkempt",
    "Unsightly",
    "Alive",
    "Better",
    "Careful",
    "Clever",
    "Dead",
    "Easy",
    "Famous",
    "Gifted",
    "Hallowed",
    "Helpful",
    "Important",
    "Inexpensive",
    "Mealy",
    "Mushy",
    "Odd",
    "Poor",
    "Powerful",
    "Rich",
    "Shy",
    "Tender",
    "Unimportant",
    "Uninterested",
    "Vast",
    "Wrong",
    "Angry",
    "Bewildered",
    "Clumsy",
    "Defeated",
    "Embarrassed",
    "Fierce",
    "Grumpy",
    "Helpless",
    "Itchy",
    "Jealous",
    "Lazy",
    "Mysterious",
    "Nervous",
    "Obnoxious",
    "Panicky",
    "Pitiful",
    "Repulsive",
    "Scary",
    "Thoughtless",
    "Uptight",
    "Worried",
    "Broad",
    "Chubby",
    "Crooked",
    "Curved",
    "Deep",
    "Flat",
    "High",
    "Hollow",
    "Low",
    "Narrow",
    "Refined",
    "Round",
    "Shallow",
    "Skinny",
    "Square",
    "Steep",
    "Straight",
    "Wide",
    "Big",
    "Colossal",
    "Fat",
    "Gigantic",
    "Great",
    "Huge",
    "Immense",
    "Large",
    "Little",
    "Mammoth",
    "Massive",
    "Microscopic",
    "Miniature",
    "Petite",
    "Puny",
    "Scrawny",
    "Short",
    "Small",
    "Tall",
    "Teeny",
    "Tiny",
    "Crashing",
    "Deafening",
    "Echoing",
    "Faint",
    "Harsh",
    "Hissing",
    "Howling",
    "Loud",
    "Melodic",
    "Noisy",
    "Purring",
    "Quiet",
    "Rapping",
    "Raspy",
    "Rhythmic",
    "Screeching",
    "Shrilling",
    "Squeaking",
    "Thundering",
    "Tinkling",
    "Wailing",
    "Whining",
    "Whispering",
    "Acidic",
    "Bitter",
    "Cool",
    "Creamy",
    "Delicious",
    "Disgusting",
    "Fresh",
    "Greasy",
    "Juicy",
    "Hot",
    "Moldy",
    "Nutritious",
    "Nutty",
    "Putrid",
    "Rancid",
    "Ripe",
    "Rotten",
    "Salty",
    "Savory",
    "Sour",
    "Spicy",
    "Spoiled",
    "Stale",
    "Sweet",
    "Tangy",
    "Tart",
    "Tasteless",
    "Tasty",
    "Yummy",
    "Breezy",
    "Bumpy",
    "Chilly",
    "Cold",
    "Cool",
    "Cuddly",
    "Damaged",
    "Damp",
    "Dirty",
    "Dry",
    "Flaky",
    "Fluffy",
    "Freezing",
    "Greasy",
    "Hot",
    "Icy",
    "Loose",
    "Melted",
    "Prickly",
    "Rough",
    "Shaggy",
    "Sharp",
    "Slimy",
    "Sticky",
    "Strong",
    "Tight",
    "Uneven",
    "Warm",
    "Weak",
    "Wet",
    "Wooden",
    "Abundant",
    "Incalculable",
    "Limited",
    "Little",
];
const animals = [
    "Dog",
    "Puppy",
    "Turtle",
    "Rabbit",
    "Parrot",
    "Cat",
    "Kitten",
    "Goldfish",
    "Mouse",
    "Tropical fish",
    "Hamster",
    "Cow",
    "Rabbit",
    "Ducks",
    "Shrimp",
    "Pig",
    "Goat",
    "Crab",
    "Deer",
    "Bee",
    "Sheep",
    "Fish",
    "Turkey",
    "Dove",
    "Chicken",
    "Horse",
    "Crow",
    "Peacock",
    "Dove",
    "Sparrow",
    "Goose",
    "Stork",
    "Pigeon",
    "Turkey",
    "Hawk",
    "Bald eagle",
    "Raven",
    "Parrot",
    "Flamingo",
    "Seagull",
    "Ostrich",
    "Swallow",
    "Black bird",
    "Penguin",
    "Robin",
    "Swan",
    "Owl",
    "Woodpecker",
    "Squirrel",
    "Dog",
    "Chimpanzee",
    "Ox",
    "Lion",
    "Panda",
    "Walrus",
    "Otter",
    "Mouse",
    "Kangaroo",
    "Goat",
    "Horse",
    "Monkey",
    "Cow",
    "Koala",
    "Mole",
    "Elephant",
    "Leopard",
    "Hippopotamus",
    "Giraffe",
    "Fox",
    "Coyote",
    "Hedgehong",
    "Sheep",
    "Deer",
    "Giraffe",
    "Woodpecker",
    "Camel",
    "Starfish",
    "Koala",
    "Alligator",
    "Owl",
    "Tiger",
    "Bear",
    "Blue whale",
    "Coyote",
    "Chimpanzee",
    "Raccoon",
    "Lion",
    "Arctic wolf",
    "Crocodile",
    "Dolphin",
    "Elephant",
    "Squirrel",
    "Snake",
    "Kangaroo",
    "Hippopotamus",
    "Elk",
    "Fox",
    "Gorilla",
    "Bat",
    "Hare",
    "Toad",
    "Frog",
    "Deer",
    "Rat",
    "Badger",
    "Lizard",
    "Mole",
    "Hedgehog",
    "Otter",
    "Reindeer",
    "Crab",
    "Fish",
    "Seal",
    "Octopus",
    "Shark",
    "Seahorse",
    "Walrus",
    "Starfish",
    "Whale",
    "Penguin",
    "Jellyfish",
    "Squid",
    "Lobster",
    "Pelican",
    "Clams",
    "Seagull",
    "Dolphin",
    "Shells",
    "Sea urchin",
    "Cormorant",
    "Otter",
    "Pelican",
    "Sea anemone",
    "Sea turtle",
    "Sea lion",
    "Coral",
    "Moth",
    "Bee",
    "Butterfly",
    "Spider",
    "Ladybird",
    "Ladybug",
    "Ant",
    "Dragonfly",
    "Fly",
    "Mosquito",
    "Grasshopper",
    "Beetle",
    "Cockroach",
    "Centipede",
    "Worm",
    "Louse",
];
function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    //The maximum is exclusive and the minimum is inclusive
    return Math.floor(Math.random() * (max - min)) + min;
}
export default function getName() {
    const animal = animals[getRandomInt(0, animals.length)];
    const adjective = adjectives[getRandomInt(0, adjectives.length)];
    return `${adjective} ${animal}`;
}

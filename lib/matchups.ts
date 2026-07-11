import type { Matchup } from "./types";

export interface Athlete {
  name: string;
  /** Self-hosted photo path. Only the original 43 curated picks have one; */
  /** everyone else falls back to a generated initials avatar (see PlayerAvatar). */
  image?: string;
}

export interface SportEntry {
  sport: string;
  athletes: Athlete[];
}

/**
 * The curated database: 50 real players per sport, top-50-all-time style
 * rosters compiled from multiple published rankings. The original picks
 * (below) have real photos self-hosted in public/players/ (originally
 * sourced from Wikipedia, since Wikimedia rate-limits high-frequency
 * external requests to the same images). Everyone added after that has no
 * photo on file and renders as an initials avatar instead.
 */
export const SPORTS: SportEntry[] = [
  {
    sport: "Basketball",
    athletes: [
      { name: "Michael Jordan", image: "/players/michael-jordan.jpg" },
      { name: "LeBron James", image: "/players/lebron-james.jpg" },
      { name: "Kobe Bryant", image: "/players/kobe-bryant.jpg" },
      { name: "Magic Johnson", image: "/players/magic-johnson.jpg" },
      { name: "Larry Bird", image: "/players/larry-bird.jpg" },
      { name: "Kareem Abdul-Jabbar", image: "/players/kareem-abdul-jabbar.jpg" },
      { name: "Stephen Curry", image: "/players/stephen-curry.jpg" },
      { name: "Shaquille O'Neal", image: "/players/shaquille-oneal.jpg" },
      { name: "Wilt Chamberlain" },
      { name: "Bill Russell" },
      { name: "Tim Duncan" },
      { name: "Oscar Robertson" },
      { name: "Kevin Durant" },
      { name: "Hakeem Olajuwon" },
      { name: "Julius Erving" },
      { name: "Moses Malone" },
      { name: "Nikola Jokic" },
      { name: "Dirk Nowitzki" },
      { name: "Giannis Antetokounmpo" },
      { name: "Jerry West" },
      { name: "Elgin Baylor" },
      { name: "Kevin Garnett" },
      { name: "Charles Barkley" },
      { name: "Karl Malone" },
      { name: "John Stockton" },
      { name: "David Robinson" },
      { name: "John Havlicek" },
      { name: "Isiah Thomas" },
      { name: "George Mikan" },
      { name: "Chris Paul" },
      { name: "Dwyane Wade" },
      { name: "Allen Iverson" },
      { name: "Scottie Pippen" },
      { name: "Kawhi Leonard" },
      { name: "Bob Cousy" },
      { name: "Bob Pettit" },
      { name: "Dominique Wilkins" },
      { name: "Steve Nash" },
      { name: "Rick Barry" },
      { name: "Kevin McHale" },
      { name: "Patrick Ewing" },
      { name: "Walt Frazier" },
      { name: "Gary Payton" },
      { name: "Jason Kidd" },
      { name: "Bill Walton" },
      { name: "Bob McAdoo" },
      { name: "Jerry Lucas" },
      { name: "Ray Allen" },
      { name: "Wes Unseld" },
      { name: "Nate Thurmond" },
    ],
  },
  {
    sport: "Soccer",
    athletes: [
      { name: "Lionel Messi", image: "/players/lionel-messi.jpg" },
      { name: "Cristiano Ronaldo", image: "/players/cristiano-ronaldo.jpg" },
      { name: "Pelé", image: "/players/pele.jpg" },
      { name: "Diego Maradona", image: "/players/diego-maradona.jpg" },
      { name: "Zinedine Zidane", image: "/players/zinedine-zidane.jpg" },
      { name: "Neymar", image: "/players/neymar.jpg" },
      { name: "Ronaldinho", image: "/players/ronaldinho.jpg" },
      { name: "Kylian Mbappé", image: "/players/kylian-mbappe.jpg" },
      { name: "Johan Cruyff" },
      { name: "Franz Beckenbauer" },
      { name: "Alfredo Di Stéfano" },
      { name: "Ferenc Puskás" },
      { name: "Eusébio" },
      { name: "George Best" },
      { name: "Michel Platini" },
      { name: "Gerd Müller" },
      { name: "Ronaldo Nazário" },
      { name: "Garrincha" },
      { name: "Paolo Maldini" },
      { name: "Bobby Charlton" },
      { name: "Romário" },
      { name: "Zico" },
      { name: "Franco Baresi" },
      { name: "Marco van Basten" },
      { name: "Xavi" },
      { name: "Andrés Iniesta" },
      { name: "Lev Yashin" },
      { name: "Bobby Moore" },
      { name: "Roberto Baggio" },
      { name: "Ruud Gullit" },
      { name: "Luka Modrić" },
      { name: "Thierry Henry" },
      { name: "Sócrates" },
      { name: "Giuseppe Meazza" },
      { name: "Raymond Kopa" },
      { name: "Gianluigi Buffon" },
      { name: "Karl-Heinz Rummenigge" },
      { name: "Luis Suárez" },
      { name: "Zlatan Ibrahimović" },
      { name: "Kaká" },
      { name: "Robert Lewandowski" },
      { name: "Kevin De Bruyne" },
      { name: "Dennis Bergkamp" },
      { name: "Cafu" },
      { name: "Roberto Carlos" },
      { name: "Rivaldo" },
      { name: "Alan Shearer" },
      { name: "Wayne Rooney" },
      { name: "Philipp Lahm" },
      { name: "George Weah" },
    ],
  },
  {
    sport: "Tennis",
    athletes: [
      { name: "Roger Federer", image: "/players/roger-federer.jpg" },
      { name: "Rafael Nadal", image: "/players/rafael-nadal.jpg" },
      { name: "Novak Djokovic", image: "/players/novak-djokovic.jpg" },
      { name: "Serena Williams", image: "/players/serena-williams.jpg" },
      { name: "Steffi Graf", image: "/players/steffi-graf.jpg" },
      { name: "Andy Murray", image: "/players/andy-murray.jpg" },
      { name: "Venus Williams", image: "/players/venus-williams.jpg" },
      { name: "Rod Laver" },
      { name: "Martina Navratilova" },
      { name: "Pete Sampras" },
      { name: "Björn Borg" },
      { name: "Margaret Court" },
      { name: "Chris Evert" },
      { name: "Billie Jean King" },
      { name: "Andre Agassi" },
      { name: "John McEnroe" },
      { name: "Jimmy Connors" },
      { name: "Ivan Lendl" },
      { name: "Monica Seles" },
      { name: "Ken Rosewall" },
      { name: "Boris Becker" },
      { name: "Suzanne Lenglen" },
      { name: "Stefan Edberg" },
      { name: "Justine Henin" },
      { name: "Maureen Connolly" },
      { name: "Arthur Ashe" },
      { name: "Helen Wills" },
      { name: "Martina Hingis" },
      { name: "Bill Tilden" },
      { name: "Don Budge" },
      { name: "Roy Emerson" },
      { name: "John Newcombe" },
      { name: "Mats Wilander" },
      { name: "Pancho Gonzalez" },
      { name: "Evonne Goolagong Cawley" },
      { name: "Maria Bueno" },
      { name: "Althea Gibson" },
      { name: "Guillermo Vilas" },
      { name: "Jim Courier" },
      { name: "Lindsay Davenport" },
      { name: "Arantxa Sánchez Vicario" },
      { name: "Kim Clijsters" },
      { name: "Tracy Austin" },
      { name: "Jennifer Capriati" },
      { name: "Alice Marble" },
      { name: "Virginia Wade" },
      { name: "Lleyton Hewitt" },
      { name: "Maria Sharapova" },
      { name: "Gabriela Sabatini" },
      { name: "Marat Safin" },
    ],
  },
  {
    sport: "American Football",
    athletes: [
      { name: "Tom Brady", image: "/players/tom-brady.jpg" },
      { name: "Peyton Manning", image: "/players/peyton-manning.jpg" },
      { name: "Patrick Mahomes", image: "/players/patrick-mahomes.jpg" },
      { name: "Jerry Rice", image: "/players/jerry-rice.jpg" },
      { name: "Aaron Rodgers", image: "/players/aaron-rodgers.jpg" },
      { name: "Joe Montana", image: "/players/joe-montana.jpg" },
      { name: "Jim Brown" },
      { name: "Lawrence Taylor" },
      { name: "Walter Payton" },
      { name: "Reggie White" },
      { name: "Dick Butkus" },
      { name: "Don Hutson" },
      { name: "Johnny Unitas" },
      { name: "Deacon Jones" },
      { name: "Barry Sanders" },
      { name: "Joe Greene" },
      { name: "Anthony Munoz" },
      { name: "John Elway" },
      { name: "Ray Lewis" },
      { name: "Deion Sanders" },
      { name: "Aaron Donald" },
      { name: "Ronnie Lott" },
      { name: "Randy Moss" },
      { name: "John Hannah" },
      { name: "Rod Woodson" },
      { name: "Sammy Baugh" },
      { name: "Bruce Smith" },
      { name: "Jonathan Ogden" },
      { name: "Emmitt Smith" },
      { name: "Bob Lilly" },
      { name: "Larry Allen" },
      { name: "Larry Fitzgerald" },
      { name: "Tony Gonzalez" },
      { name: "Mike Webster" },
      { name: "Ed Reed" },
      { name: "Adam Vinatieri" },
      { name: "Shane Lechler" },
      { name: "Devin Hester" },
      { name: "Rob Gronkowski" },
      { name: "Dan Marino" },
      { name: "Brett Favre" },
      { name: "Otto Graham" },
      { name: "Gale Sayers" },
      { name: "Earl Campbell" },
      { name: "Marshall Faulk" },
      { name: "LaDainian Tomlinson" },
      { name: "Steve Largent" },
      { name: "Paul Warfield" },
      { name: "Terrell Owens" },
      { name: "Marvin Harrison" },
    ],
  },
  {
    sport: "Boxing",
    athletes: [
      { name: "Muhammad Ali", image: "/players/muhammad-ali.jpg" },
      { name: "Mike Tyson", image: "/players/mike-tyson.jpg" },
      { name: "Floyd Mayweather", image: "/players/floyd-mayweather.jpg" },
      { name: "Manny Pacquiao", image: "/players/manny-pacquiao.jpg" },
      { name: "Sugar Ray Robinson", image: "/players/sugar-ray-robinson.jpg" },
      { name: "George Foreman", image: "/players/george-foreman.jpg" },
      { name: "Henry Armstrong" },
      { name: "Joe Louis" },
      { name: "Willie Pep" },
      { name: "Roberto Duran" },
      { name: "Benny Leonard" },
      { name: "Jack Johnson" },
      { name: "Jack Dempsey" },
      { name: "Sam Langford" },
      { name: "Joe Gans" },
      { name: "Sugar Ray Leonard" },
      { name: "Harry Greb" },
      { name: "Rocky Marciano" },
      { name: "Jimmy Wilde" },
      { name: "Gene Tunney" },
      { name: "Mickey Walker" },
      { name: "Archie Moore" },
      { name: "Stanley Ketchel" },
      { name: "Tony Canzoneri" },
      { name: "Julio César Chávez" },
      { name: "Joe Frazier" },
      { name: "Ezzard Charles" },
      { name: "Sandy Saddler" },
      { name: "Marvin Hagler" },
      { name: "Thomas Hearns" },
      { name: "Larry Holmes" },
      { name: "Oscar De La Hoya" },
      { name: "Pernell Whitaker" },
      { name: "Roy Jones Jr." },
      { name: "Bernard Hopkins" },
      { name: "Bob Fitzsimmons" },
      { name: "Terence Crawford" },
      { name: "Salvador Sánchez" },
      { name: "Joe Calzaghe" },
      { name: "John L. Sullivan" },
      { name: "Lennox Lewis" },
      { name: "Gennady Golovkin" },
      { name: "Oleksandr Usyk" },
      { name: "Canelo Álvarez" },
      { name: "Andre Ward" },
      { name: "Michael Spinks" },
      { name: "Jake LaMotta" },
      { name: "Barney Ross" },
      { name: "Evander Holyfield" },
      { name: "Alexis Argüello" },
    ],
  },
  {
    sport: "Cricket",
    athletes: [
      { name: "Sachin Tendulkar", image: "/players/sachin-tendulkar.jpg" },
      { name: "Virat Kohli", image: "/players/virat-kohli.jpg" },
      { name: "Don Bradman", image: "/players/don-bradman.jpg" },
      { name: "Viv Richards", image: "/players/viv-richards.jpg" },
      { name: "Jack Hobbs" },
      { name: "Wally Hammond" },
      { name: "Len Hutton" },
      { name: "Denis Compton" },
      { name: "Fred Trueman" },
      { name: "Ian Botham" },
      { name: "Joe Root" },
      { name: "Ben Stokes" },
      { name: "Victor Trumper" },
      { name: "Dennis Lillee" },
      { name: "Richie Benaud" },
      { name: "Shane Warne" },
      { name: "Glenn McGrath" },
      { name: "Allan Border" },
      { name: "Steve Waugh" },
      { name: "Ricky Ponting" },
      { name: "Adam Gilchrist" },
      { name: "Steve Smith" },
      { name: "Garfield Sobers" },
      { name: "Frank Worrell" },
      { name: "Everton Weekes" },
      { name: "Clyde Walcott" },
      { name: "Rohan Kanhai" },
      { name: "Clive Lloyd" },
      { name: "Michael Holding" },
      { name: "Malcolm Marshall" },
      { name: "Curtly Ambrose" },
      { name: "Brian Lara" },
      { name: "Imran Khan" },
      { name: "Javed Miandad" },
      { name: "Hanif Mohammad" },
      { name: "Wasim Akram" },
      { name: "Waqar Younis" },
      { name: "Inzamam-ul-Haq" },
      { name: "Sunil Gavaskar" },
      { name: "Kapil Dev" },
      { name: "Rahul Dravid" },
      { name: "Anil Kumble" },
      { name: "MS Dhoni" },
      { name: "Jasprit Bumrah" },
      { name: "Barry Richards" },
      { name: "Graeme Pollock" },
      { name: "Jacques Kallis" },
      { name: "AB de Villiers" },
      { name: "Dale Steyn" },
      { name: "Muttiah Muralitharan" },
    ],
  },
  {
    sport: "Ice Hockey",
    athletes: [
      { name: "Wayne Gretzky", image: "/players/wayne-gretzky.jpg" },
      { name: "Alex Ovechkin", image: "/players/alex-ovechkin.jpg" },
      { name: "Mario Lemieux", image: "/players/mario-lemieux.jpg" },
      { name: "Bobby Orr", image: "/players/bobby-orr.jpg" },
      { name: "Gordie Howe" },
      { name: "Maurice Richard" },
      { name: "Doug Harvey" },
      { name: "Jean Béliveau" },
      { name: "Bobby Hull" },
      { name: "Terry Sawchuk" },
      { name: "Eddie Shore" },
      { name: "Guy Lafleur" },
      { name: "Mark Messier" },
      { name: "Jacques Plante" },
      { name: "Ray Bourque" },
      { name: "Howie Morenz" },
      { name: "Glenn Hall" },
      { name: "Stan Mikita" },
      { name: "Phil Esposito" },
      { name: "Denis Potvin" },
      { name: "Mike Bossy" },
      { name: "Ted Lindsay" },
      { name: "Patrick Roy" },
      { name: "Red Kelly" },
      { name: "Bobby Clarke" },
      { name: "Larry Robinson" },
      { name: "Ken Dryden" },
      { name: "Frank Mahovlich" },
      { name: "Milt Schmidt" },
      { name: "Paul Coffey" },
      { name: "Henri Richard" },
      { name: "Bryan Trottier" },
      { name: "Syl Apps" },
      { name: "Bill Durnan" },
      { name: "Jaromir Jagr" },
      { name: "Marcel Dionne" },
      { name: "Chris Chelios" },
      { name: "Bernie Geoffrion" },
      { name: "Gilbert Perreault" },
      { name: "Brad Park" },
      { name: "Jari Kurri" },
      { name: "Brett Hull" },
      { name: "Steve Yzerman" },
      { name: "Joe Sakic" },
      { name: "Dominik Hasek" },
      { name: "Sidney Crosby" },
      { name: "Pavel Datsyuk" },
      { name: "Nicklas Lidstrom" },
      { name: "Peter Forsberg" },
      { name: "Martin Brodeur" },
    ],
  },
];

/** Every known player, flattened, for search/autocomplete across all sports. */
export const ALL_ATHLETES: { sport: string; athlete: Athlete }[] = SPORTS.flatMap((s) =>
  s.athletes.map((athlete) => ({ sport: s.sport, athlete })),
);

/** Quick-start picks shown as chips on the home screen. */
export const FEATURED: Matchup[] = [
  { sport: "Basketball", a: "Michael Jordan", b: "LeBron James" },
  { sport: "Soccer", a: "Lionel Messi", b: "Cristiano Ronaldo" },
  { sport: "Tennis", a: "Roger Federer", b: "Rafael Nadal" },
  { sport: "American Football", a: "Tom Brady", b: "Peyton Manning" },
  { sport: "Boxing", a: "Muhammad Ali", b: "Mike Tyson" },
  { sport: "Basketball", a: "Kobe Bryant", b: "LeBron James" },
  { sport: "Soccer", a: "Pelé", b: "Diego Maradona" },
  { sport: "Cricket", a: "Sachin Tendulkar", b: "Virat Kohli" },
  { sport: "Ice Hockey", a: "Wayne Gretzky", b: "Alex Ovechkin" },
];

export function athletesFor(sport: string): Athlete[] {
  return SPORTS.find((s) => s.sport.toLowerCase() === sport.toLowerCase())?.athletes ?? [];
}

export function athleteNamesFor(sport: string): string[] {
  return athletesFor(sport).map((a) => a.name);
}

/** Looks up a known player's photo, matched loosely by name (any sport if none given). */
export function imageFor(sport: string, name: string): string | null {
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) return null;
  const inSport = athletesFor(sport).find((a) => a.name.toLowerCase() === trimmed);
  if (inSport) return inSport.image ?? null;
  const anywhere = ALL_ATHLETES.find((e) => e.athlete.name.toLowerCase() === trimmed);
  return anywhere?.athlete.image ?? null;
}

/** True if a name matches a curated athlete (any sport) - used to skip live verification for known picks. */
export function isKnownAthlete(name: string): boolean {
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) return false;
  return ALL_ATHLETES.some((e) => e.athlete.name.toLowerCase() === trimmed);
}

/** Sport name suggestions for the sport field, matched by prefix/substring. */
export function suggestSports(query: string): string[] {
  const q = query.trim().toLowerCase();
  const names = SPORTS.map((s) => s.sport);
  if (!q) return names;
  return names.filter((s) => s.toLowerCase().includes(q));
}

/** Shown when browsing with an empty field - a scrollable starting list, not the whole roster. */
const BROWSE_SUGGESTION_LIMIT = 25;
/** Shown once the user is actively typing - a wider net across the full roster. */
const SEARCH_SUGGESTION_LIMIT = 50;

/** Player suggestions, preferring the current sport's roster, matched by substring. */
export function suggestAthletes(query: string, sport: string, exclude: string): string[] {
  const q = query.trim().toLowerCase();
  const excludeLower = exclude.trim().toLowerCase();
  const inSport = athleteNamesFor(sport);
  const pool = inSport.length > 0 ? inSport : ALL_ATHLETES.map((e) => e.athlete.name);
  const unique = Array.from(new Set(pool)).filter((n) => n.toLowerCase() !== excludeLower);
  if (!q) return unique.slice(0, BROWSE_SUGGESTION_LIMIT);
  return unique.filter((n) => n.toLowerCase().includes(q)).slice(0, SEARCH_SUGGESTION_LIMIT);
}

export function randomMatchup(): Matchup {
  return FEATURED[Math.floor(Math.random() * FEATURED.length)];
}

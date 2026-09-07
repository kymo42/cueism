export interface QuizQuestion {
	id: string;
	tier: 1 | 2 | 3 | 4 | 5;
	fargoMin: number;
	fargoMax: number;
	tierTitle: string;
	question: string;
	scenario?: string;
	options: string[];
	correctIndex: number;
	explanation: string;
	levelUpAdvice: string;
	videoId: string;
	videoTitle: string;
}

export interface FargoTierInfo {
	tier: 1 | 2 | 3 | 4 | 5;
	minFargo: number;
	maxFargo: number;
	title: string;
	tagline: string;
	overview: string;
}

export const FARGO_TIERS: Record<number, FargoTierInfo> = {
	1: {
		tier: 1,
		minFargo: 300,
		maxFargo: 425,
		title: "Casual & Bar League Player",
		tagline: "Solid foundations in progress",
		overview:
			"You understand how the game works, but loose cue mechanics and overhitting balls often leave you out of position.",
	},
	2: {
		tier: 2,
		minFargo: 425,
		maxFargo: 500,
		title: "Competitive League Shooter (C+ / B-)",
		tagline: "Table angles & rolling cue ball control",
		overview:
			"You can run 3-5 balls reliably and know basic cut angles. Managing rail rebound angles and cue ball scratch lines is your next step.",
	},
	3: {
		tier: 3,
		minFargo: 500,
		maxFargo: 575,
		title: "Advanced Shotmaker (B / A-)",
		tagline: "Physics-driven spin & speed control",
		overview:
			"You control the cue ball with English, understand two-way safeties, and play defensive counters when position goes awry.",
	},
	4: {
		tier: 4,
		minFargo: 575,
		maxFargo: 650,
		title: "Master Tactician (A / Semi-Pro)",
		tagline: "Throw compensation & strategic endgame IQ",
		overview:
			"You navigate clusters with micro-speed, adjust for friction throw, and use strategic fouls to lock down wins.",
	},
	5: {
		tier: 5,
		minFargo: 650,
		maxFargo: 750,
		title: "Elite / Pro Caliber",
		tagline: "Flawless pre-shot calm & table mastery",
		overview:
			"You operate at the highest competitive level where nervous system stillness, quiet eyes, and deep pattern discipline reign supreme.",
	},
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
	// ==========================================
	// TIER 1: Fargo < 425 (Foundations & Physics)
	// ==========================================
	{
		id: "t1-q1",
		tier: 1,
		fargoMin: 320,
		fargoMax: 420,
		tierTitle: "Level 1: Bar League Basics (Fargo < 425)",
		question: "When the cue ball hits an object ball with pure sliding stun (no topspin or backspin), at what angle does it deflect?",
		scenario: "You have an angled cut shot and need to ensure the cue ball doesn't follow the object ball into the pocket.",
		options: [
			"At approximately 45 degrees",
			"At exactly 90 degrees along the tangent line",
			"It continues forward at 30 degrees",
			"It stops dead on the collision line"
		],
		correctIndex: 1,
		explanation: "The 90-Degree Rule states that whenever the cue ball has zero vertical spin at contact (sliding stun), it always deflects along the tangent line at exactly 90° to the object ball's path.",
		levelUpAdvice: "Master sliding stun shots to predict your scratch angles instantly on any cut.",
		videoId: "vJhfanW29AA",
		videoTitle: "How the 90 Degree Rule Prevents Scratches"
	},
	{
		id: "t1-q2",
		tier: 1,
		fargoMin: 340,
		fargoMax: 425,
		tierTitle: "Level 1: Bar League Basics (Fargo < 425)",
		question: "How tight should your grip hand hold the cue during your stroke?",
		scenario: "You're trying to hit with more power or get extra draw on the cue ball.",
		options: [
			"As tight as possible to ensure maximum power transfer",
			"With a loose 'feather grip' (approx. 2 out of 10 pressure) to let the cue accelerate naturally",
			"Tight on the backswing, then released at impact",
			"Firmly with the thumb and forefinger pressed hard against the wrap"
		],
		correctIndex: 1,
		explanation: "Gripping the cue tightly locks your wrist and forearm, introducing steering wobble and killing tip speed. A feather grip lets the cue flow freely and delivers effortless power and draw.",
		levelUpAdvice: "Lighten your grip to 2/10. Let the weight and momentum of the cue do the work.",
		videoId: "Su2SgYNGDwc",
		videoTitle: "Grip Softer, Hit Harder"
	},
	{
		id: "t1-q3",
		tier: 1,
		fargoMin: 350,
		fargoMax: 425,
		tierTitle: "Level 1: Bar League Basics (Fargo < 425)",
		question: "In 8-ball, why is pocketing all your easy open balls right away often a fatal strategic mistake?",
		scenario: "You have 5 easy open balls, but 2 of your balls are tied up in clusters with no pocket available.",
		options: [
			"Because the rules deduct points for sinking balls before breaking clusters",
			"Your open balls act as blockers; clearing them clears the table for your opponent while leaving you stranded",
			"Because the cue ball must contact your opponent's ball first if clusters exist",
			"It lowers your official FargoRate calculation"
		],
		correctIndex: 1,
		explanation: "Your balls are your soldiers and blockers. If you pot all easy balls without solving your trouble balls, you clear open lanes for your opponent while leaving yourself completely helpless.",
		levelUpAdvice: "Play 8-ball backwards from the 8-ball. Never run easy balls without a breakout plan for your problem balls.",
		videoId: "AlznLgl7do0",
		videoTitle: "Stop Sinking Your Balls So Fast in 8 Ball"
	},

	// ==========================================
	// TIER 2: Fargo 425 - 500 (Angles & Rebound)
	// ==========================================
	{
		id: "t2-q1",
		tier: 2,
		fargoMin: 430,
		fargoMax: 490,
		tierTitle: "Level 2: Angles & Rail Rebounds (Fargo 425 - 500)",
		question: "When the cue ball is rolling naturally forward at contact (natural roll), approximately what angle does it deflect away from the aim line?",
		scenario: "You're cutting a ball into the corner and want to know where the cue ball will roll across the table.",
		options: [
			"It deflects at 90 degrees",
			"Approximately 30 degrees (the 'peace sign' rule)",
			"It always rolls directly straight along the initial cue line",
			"It deflects at 60 degrees"
		],
		correctIndex: 1,
		explanation: "The 30-Degree Rule shows that a naturally rolling cue ball deflects at approximately 30° over almost all typical cut angles (from 1/4 to 3/4 ball hits). You can visualize it by forming a 'peace sign' with your fingers.",
		levelUpAdvice: "Use the peace-sign 30-degree rule to map cue ball escape paths and dodge scratch pockets.",
		videoId: "wh_pANYTqrU",
		videoTitle: "The Peace Sign Trick to Stop Scratching"
	},
	{
		id: "t2-q2",
		tier: 2,
		fargoMin: 440,
		fargoMax: 500,
		tierTitle: "Level 2: Angles & Rail Rebounds (Fargo 425 - 500)",
		question: "If you shoot a bank or kick shot at high speed instead of soft rolling speed, how does the rebound angle off the rail change?",
		scenario: "You need to kick at a ball behind a blocker and are choosing between a soft tap and a firm stroke.",
		options: [
			"High speed widens the rebound angle out wider",
			"High speed compresses the rail rubber deeper, causing the ball to rebound shorter/stiffer",
			"The rebound angle remains mathematically identical regardless of speed",
			"High speed adds natural topspin that reverses the ball"
		],
		correctIndex: 1,
		explanation: "Hard hits compress the cushion rubber deeper, grabbing the ball and rebounding it stiffer/shorter than the incoming angle. Soft rolling shots bounce wider.",
		levelUpAdvice: "Calibrate your kick shots at a consistent medium rolling speed so diamond geometry stays true.",
		videoId: "0ioVhTUwHQU",
		videoTitle: "Kick Shots Change With Speed Heres How"
	},
	{
		id: "t2-q3",
		tier: 2,
		fargoMin: 450,
		fargoMax: 500,
		tierTitle: "Level 2: Angles & Rail Rebounds (Fargo 425 - 500)",
		question: "When the cue ball is frozen against the rail, what setup tweak gives you a clean cut without scraping the rail edge?",
		scenario: "The cue ball is pressed right against the side cushion and you have to cut an object ball into the corner.",
		options: [
			"Drop the butt of the cue down level with the cloth",
			"Slightly elevate the cue butt so the tip strikes downward cleanly without contacting the wooden rail cap",
			"Use maximum reverse sidespin to pull the ball off the cushion",
			"Scoop underneath the cue ball to hop it off the rail"
		],
		correctIndex: 1,
		explanation: "Slightly elevating the cue butt clears the cushion height, allowing the tip to cleanly strike the cue ball from above without your shaft or ferrule clipping the wooden rail.",
		levelUpAdvice: "Elevate just enough to clear the rail bevel; keep elevation minimal to prevent unintended swerve.",
		videoId: "BVSAVs-rswU",
		videoTitle: "How Cue Elevation Fixes Rail Cuts"
	},

	// ==========================================
	// TIER 3: Fargo 500 - 575 (Deflection & Control)
	// ==========================================
	{
		id: "t3-q1",
		tier: 3,
		fargoMin: 505,
		fargoMax: 560,
		tierTitle: "Level 3: Cue Ball Physics & Safeties (Fargo 500 - 575)",
		question: "When using sidespin (English), the cue ball squirts slightly offline. How does bridging at your shaft's 'natural pivot length' cancel this out?",
		scenario: "You need right-hand English for position on the next ball, but don't want to guess the squirt offset.",
		options: [
			"It makes the cue ball heavier at contact",
			"Bridging at the pivot point means the cue stick's pivot angle exactly matches and cancels the cue ball's squirt angle",
			"It eliminates all friction between the ball and cloth",
			"It increases the cue tip diameter dynamically"
		],
		correctIndex: 1,
		explanation: "Every cue shaft has a natural pivot point (usually 10-13 inches from the tip). When you bridge at that distance, pivoting your cue to apply spin naturally points the cue offline by the exact amount needed to cancel squirt.",
		levelUpAdvice: "Find your cue's natural pivot point by testing side-spin sweeps on straight shots until misses disappear.",
		videoId: "GlOS_P_U6sU",
		videoTitle: "How Natural Pivot Length Fixes Your Break"
	},
	{
		id: "t3-q2",
		tier: 3,
		fargoMin: 515,
		fargoMax: 570,
		tierTitle: "Level 3: Cue Ball Physics & Safeties (Fargo 500 - 575)",
		question: "Why would a skilled player shoot a long shot with low backspin (a drag shot) when they want the cue ball to arrive slowly at the object ball?",
		scenario: "You have a full-table shot where a soft rolling hit is prone to deceleration wobble or steering errors.",
		options: [
			"Backspin causes the ball to jump slightly over chalk spots",
			"The firm hit ensures a clean, confident stroke, while backspin scrubs off speed against the cloth and converts to a soft roll at contact",
			"Backspin increases the diameter of the pocket",
			"It forces the object ball to bank off two rails"
		],
		correctIndex: 1,
		explanation: "A drag shot allows a firm, accelerated stroke (eliminating steering twitches). The backspin fights the cloth friction, bleeding speed over the journey and reaching the ball as a gentle, controllable roll.",
		levelUpAdvice: "Replace timid, 'baby' strokes on long shots with a firm drag stroke for pinpoint speed control.",
		videoId: "vSOP6wZLzRY",
		videoTitle: "How the Drag Shot Controls the Cue Ball"
	},
	{
		id: "t3-q3",
		tier: 3,
		fargoMin: 530,
		fargoMax: 575,
		tierTitle: "Level 3: Cue Ball Physics & Safeties (Fargo 500 - 575)",
		question: "What is a 'two-way shot' and why is it a staple of high-level tournament play?",
		scenario: "You have a tough cut shot that carries significant risk of missing.",
		options: [
			"Pocketing two balls on a single stroke",
			"Playing an offensive pot while intentionally directing the cue ball to a defensive safe zone if the shot misses",
			"Hitting a bank shot that can go into either of two pockets",
			"Switching between your dominant and non-dominant hand"
		],
		correctIndex: 1,
		explanation: "A two-way shot eliminates downside. If the ball drops, you keep shooting; if it misses, your cue ball speed and direction leave your opponent snookered or trapped on the rail.",
		levelUpAdvice: "On any cut with under 80% confidence, choose a speed and cue ball route that leaves a safety if you miss.",
		videoId: "5zwMQyJ5bAU",
		videoTitle: "The Shot That Wins Even When You Miss"
	},

	// ==========================================
	// TIER 4: Fargo 575 - 650 (Tactical Mastery)
	// ==========================================
	{
		id: "t4-q1",
		tier: 4,
		fargoMin: 580,
		fargoMax: 630,
		tierTitle: "Level 4: Master Tactical Play (Fargo 575 - 650)",
		question: "On a slow, medium-cut shot, how does Cut-Induced Throw (CIT) alter the object ball's trajectory?",
		scenario: "You're cutting an object ball at slow speed with clean center-ball cue delivery.",
		options: [
			"It throws the object ball wider into the pocket",
			"Friction between balls grips and pushes the object ball offline, causing it to hit thick/undercut",
			"It causes the object ball to draw backwards",
			"Throw only occurs if the cue ball has sidespin applied"
		],
		correctIndex: 1,
		explanation: "At slow speeds, ball-to-ball friction is maximized. The cue ball drags the object ball in the direction of contact, throwing it offline (thicker than geometric line of centers) unless compensated.",
		levelUpAdvice: "On slow cuts, aim slightly thinner or apply a whisper of outside spin to cancel cut-induced throw.",
		videoId: "_12CIg4EitA",
		videoTitle: "How Masters Adjust for Collision Induced Throw"
	},
	{
		id: "t4-q2",
		tier: 4,
		fargoMin: 590,
		fargoMax: 640,
		tierTitle: "Level 4: Master Tactical Play (Fargo 575 - 650)",
		question: "In competitive 8-ball, when is committing an intentional foul the mathematically superior move?",
		scenario: "You are snookered. Your opponent has one open hanger ball left and an easy 8-ball out.",
		options: [
			"Never, because giving ball-in-hand guarantees a loss",
			"When you can gently tie up their key ball into an intractable cluster, denying them an out even with ball-in-hand",
			"Only when the shot clock drops under 10 seconds",
			"Whenever you are behind on the scoreboard"
		],
		correctIndex: 1,
		explanation: "Top players concede ball-in-hand if they can permanently block an opponent's key pocket or lock up their final ball into a cluster. Ball-in-hand cannot win a game if no pocket exists.",
		levelUpAdvice: "Weigh ball-in-hand penalty against table lockup. When trapped, look for an intentional foul that stops the runout.",
		videoId: "m-jPfFvla-I",
		videoTitle: "How Intentional Fouls Win Pool Games"
	},
	{
		id: "t4-q3",
		tier: 4,
		fargoMin: 600,
		fargoMax: 650,
		tierTitle: "Level 4: Master Tactical Play (Fargo 575 - 650)",
		question: "When executing an angled draw shot, what does the '4X Rule' warn you to watch out for?",
		scenario: "You're drawing the cue ball back off an angled cut and want to avoid an accidental scratch.",
		options: [
			"Draw distance will be 4 times greater than follow distance",
			"The cue ball's draw path can curve into a pocket at roughly 4 times the angle of separation if over-drawn",
			"You must stroke with 4 times your normal bridge length",
			"The object ball will rebound off 4 cushions"
		],
		correctIndex: 1,
		explanation: "The 4X rule models the parabolic curve of draw. A spinning cue ball initial arcs out along the tangent line before backspin bites and pulls it back sharply, often heading straight into corner pockets.",
		levelUpAdvice: "Anticipate the curved arc of your draw shots rather than assuming a straight bounce line.",
		videoId: "a34eiwcuo4E",
		videoTitle: "How the 4X Rule Prevents Draw Scratches"
	},

	// ==========================================
	// TIER 5: Fargo 650+ (Elite / Pro Execution)
	// ==========================================
	{
		id: "t5-q1",
		tier: 5,
		fargoMin: 655,
		fargoMax: 720,
		tierTitle: "Level 5: Elite & Pro Mastery (Fargo 650+)",
		question: "Why do skilled players occasionally choke or miss an easy game-winning ball under pressure (the Adrenaline Trap)?",
		scenario: "Hill-hill match for the title, simple straight-in 9-ball for the win.",
		options: [
			"Cloth temperature drops rapidly during championship matches",
			"A subtle adrenaline surge accelerates heart rate and internal pacing, prompting the trigger before eyes and body settle into quiet stillness",
			"The cue tip compresses permanently on pressure shots",
			"Chalk loses electrostatic attraction during long matches"
		],
		correctIndex: 1,
		explanation: "The Adrenaline Trap causes subconscious rushing. A player perceives their pace as normal, but their pre-shot routine compresses by 20-30%. The antidote is a deliberate deep breath and a 1-second 'quiet eye' lock before pulling the trigger.",
		levelUpAdvice: "Enforce a strict 2-second 'quiet eye' stillness on game balls to neutralize adrenaline pacing spikes.",
		videoId: "vwc8hSHSzLw",
		videoTitle: "Stop Watching the Score Youll Win More"
	},
	{
		id: "t5-q2",
		tier: 5,
		fargoMin: 660,
		fargoMax: 740,
		tierTitle: "Level 5: Elite & Pro Mastery (Fargo 650+)",
		question: "When the cue ball and object ball are separated by mere millimeters (nearly touching), how does the 'Fouetté' stroke avoid a foul double-hit?",
		scenario: "Balls are 2mm apart, straight toward a pocket.",
		options: [
			"Shooting with maximum speed so the balls separate instantaneously",
			"Striking with a whip-like snap and elevated angle so tip contact terminates before the cue ball rebounds back into the tip",
			"Pushing through both balls simultaneously",
			"Hitting the table cloth first to cushion the tip"
		],
		correctIndex: 1,
		explanation: "The Fouetté (whip) stroke uses a quick, glancing tip withdrawal combined with an elevated angle, ensuring the tip is completely off the cue ball before the ball can rebound back into the tip face.",
		levelUpAdvice: "Master the whip-snap stroke and elevation to legally escape microscopic ball-freeze traps.",
		videoId: "NVOgiVrs0_8",
		videoTitle: "How the Fouetté Shot Dodges Double Hits"
	},
	{
		id: "t5-q3",
		tier: 5,
		fargoMin: 670,
		fargoMax: 750,
		tierTitle: "Level 5: Elite & Pro Mastery (Fargo 650+)",
		question: "What does scientific eye-tracking research ('Quiet Eye') reveal about how elite professionals aim compared to amateurs?",
		scenario: "Comparing eye movements during the final 1.5 seconds before cue delivery.",
		options: [
			"Pros rapidly flick their gaze between pocket and ball until the stroke finishes",
			"Pros lock their gaze in complete, motionless fixation on the exact contact point for at least 1.0–1.5 seconds before and during delivery",
			"Pros close their non-dominant eye during the final forward stroke",
			"Pros look exclusively at their bridge hand to check cue alignment"
		],
		correctIndex: 1,
		explanation: "The 'Quiet Eye' phenomenon shows that elite shooters lock their gaze on the specific contact point without darting or shifting during the final pause and delivery, creating optimal neural aim calibration.",
		levelUpAdvice: "Hold your gaze motionless on the contact spot for one full second before starting your final stroke.",
		videoId: "bIhBDDQMwoA",
		videoTitle: "How Quiet Eyes Lock Your Aim"
	}
];

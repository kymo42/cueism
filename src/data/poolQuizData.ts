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
			"You understand the rules, but loose cue mechanics, gripping too tight, and overhitting balls often leave you stranded.",
	},
	2: {
		tier: 2,
		minFargo: 425,
		maxFargo: 500,
		title: "Competitive League Shooter (C+ / B-)",
		tagline: "Table angles & rolling cue ball control",
		overview:
			"You can run 3-5 balls reliably and know basic cut angles. Managing rail rebound speed and cue ball scratch lines is your next step.",
	},
	3: {
		tier: 3,
		minFargo: 500,
		maxFargo: 575,
		title: "Advanced Shotmaker (B / A-)",
		tagline: "Physics-driven spin & speed control",
		overview:
			"You control the cue ball with English, understand two-way safeties, and play smart defensive counters when position goes awry.",
	},
	4: {
		tier: 4,
		minFargo: 575,
		maxFargo: 650,
		title: "Master Tactician (A / Semi-Pro)",
		tagline: "Throw compensation & strategic endgame IQ",
		overview:
			"You navigate clusters with micro-speed, adjust for friction throw, and use strategic fouls or lockouts to guarantee match wins.",
	},
	5: {
		tier: 5,
		minFargo: 650,
		maxFargo: 750,
		title: "Elite / Pro Caliber",
		tagline: "Flawless pre-shot calm & table mastery",
		overview:
			"You operate at the highest competitive tier where nervous system stillness, quiet eyes, and deep pattern discipline reign supreme.",
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
			"It continues forward at 30 degrees",
			"At exactly 90 degrees along the tangent line",
			"It stops dead on the collision line",
			"At approximately 45 degrees",
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
		fargoMin: 330,
		fargoMax: 425,
		tierTitle: "Level 1: Bar League Basics (Fargo < 425)",
		question: "How tight should your grip hand hold the cue during your stroke?",
		scenario: "You're trying to hit with more power or get extra draw on the cue ball.",
		options: [
			"Firmly with the thumb and forefinger pressed hard against the wrap",
			"Tight on the backswing, then released at impact",
			"As tight as possible to ensure maximum power transfer",
			"With a loose 'feather grip' (approx. 2 out of 10 pressure) to let the cue accelerate naturally",
		],
		correctIndex: 3,
		explanation: "Gripping the cue tightly locks your wrist and forearm, introducing steering wobble and killing tip speed. A feather grip lets the cue flow freely and delivers effortless power and draw.",
		levelUpAdvice: "Lighten your grip to 2/10. Let the weight and momentum of the cue do the work.",
		videoId: "Su2SgYNGDwc",
		videoTitle: "Grip Softer, Hit Harder"
	},
	{
		id: "t1-q3",
		tier: 1,
		fargoMin: 340,
		fargoMax: 425,
		tierTitle: "Level 1: Bar League Basics (Fargo < 425)",
		question: "In 8-ball, why is pocketing all your easy open balls right away often a fatal strategic mistake?",
		scenario: "You have 5 easy open balls, but 2 of your balls are tied up in clusters with no pocket available.",
		options: [
			"Your open balls act as blockers; clearing them clears the table for your opponent while leaving you stranded",
			"It lowers your official FargoRate calculation",
			"Because the cue ball must contact your opponent's ball first if clusters exist",
			"Because the rules deduct points for sinking balls before breaking clusters",
		],
		correctIndex: 0,
		explanation: "Your balls are your soldiers and blockers. If you pot all easy balls without solving your trouble balls, you clear open lanes for your opponent while leaving yourself completely helpless.",
		levelUpAdvice: "Play 8-ball backwards from the 8-ball. Never run easy balls without a breakout plan for your problem balls.",
		videoId: "AlznLgl7do0",
		videoTitle: "Stop Sinking Your Balls So Fast in 8 Ball"
	},
	{
		id: "t1-q4",
		tier: 1,
		fargoMin: 350,
		fargoMax: 425,
		tierTitle: "Level 1: Bar League Basics (Fargo < 425)",
		question: "What does modern sports science say about positioning your cue stick strictly under your 'dominant eye'?",
		scenario: "You're trying to find your natural sighting line over the cue.",
		options: [
			"The 'dominant eye' rule is largely a myth; your true sight line is your unique binocular vision center",
			"You should alternate which eye is open on every shot",
			"You must always center the cue exactly under your dominant eye",
			"Right-handed players must always sight with their right eye",
		],
		correctIndex: 0,
		explanation: "Studies show pool players shoot best with their natural binocular sighting center (where both eyes work together without parallax distortion), which often sits between the eyes or slightly offset.",
		levelUpAdvice: "Find your sighting center naturally on straight-in shots rather than forcing the cue under one eye.",
		videoId: "63iNy88BnCg",
		videoTitle: "Why the Dominant Eye is a Pool Myth"
	},
	{
		id: "t1-q5",
		tier: 1,
		fargoMin: 360,
		fargoMax: 425,
		tierTitle: "Level 1: Bar League Basics (Fargo < 425)",
		question: "Why does swinging with 100% maximum power on an 8-ball or 9-ball break often produce worse results than a smooth 75% hit?",
		scenario: "You want more balls to pocket and a centered cue ball on the break.",
		options: [
			"Swinging at 100% causes off-center cue tip contact, cue ball deflection, and poor energy transfer to the head ball",
			"Balls travel too fast for the pocket openings to accept them",
			"League rules penalize breaks exceeding 25 mph",
			"Maximum speed causes the rack to absorb too much heat",
		],
		correctIndex: 0,
		explanation: "The 'Power Break Illusion' is that brute muscle wins. In reality, square center-ball contact at 75-80% transfers far more kinetic energy into the rack than an inaccurate wild 100% swing.",
		levelUpAdvice: "Focus on hitting the head ball dead square with center ball at 75% power for maximum spread and cue ball control.",
		videoId: "iPXJuGLoLeU",
		videoTitle: "The Power Break Illusion"
	},
	{
		id: "t1-q6",
		tier: 1,
		fargoMin: 370,
		fargoMax: 425,
		tierTitle: "Level 1: Bar League Basics (Fargo < 425)",
		question: "How does the '$0 Tip Tape' practice test diagnose unintentional cue delivery errors?",
		scenario: "You're missing straight-in shots and suspect your cue isn't striking where you think it is.",
		options: [
			"Placing blue tape on your tip or checking chalk smudges on the ball shows the exact off-center strike location",
			"It makes the cue lighter",
			"It increases cue tip friction by 50%",
			"It sticks the cue tip to the cue ball on impact",
		],
		correctIndex: 0,
		explanation: "Examining chalk smudges or using tip tape exposes that players who think they are hitting center ball are frequently hitting 2-3mm off-center, generating unwanted squirt and spin.",
		levelUpAdvice: "Check your chalk marks after every miss to verify whether you struck true center ball.",
		videoId: "IoR_H1JwnZI",
		videoTitle: "How Tip Tape Exposes Crooked Pool Strokes"
	},
	{
		id: "t1-q7",
		tier: 1,
		fargoMin: 380,
		fargoMax: 425,
		tierTitle: "Level 1: Bar League Basics (Fargo < 425)",
		question: "What is 'cue-less pocketing' and why does rolling balls by hand sharpen your aiming instincts?",
		scenario: "You want to build pure visual confidence without mechanical stroke distractions.",
		options: [
			"It tests whether the table slate is perfectly level",
			"Rolling balls by hand burns the true pocket entry angles directly into your visual memory without stroke errors",
			"It is an illegal bar trick used to hustle beginners",
			"It warms up the cloth before tournament matches",
		],
		correctIndex: 1,
		explanation: "Rolling balls by hand removes all physical stroke variables, allowing your brain to isolate and memorize the exact visual lines and pocket acceptance windows.",
		levelUpAdvice: "Practice rolling object balls into corner pockets by hand to calibrate your sight picture.",
		videoId: "nqp_78axQqg",
		videoTitle: "How Cue less Pocketing Maps the Table"
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
			"Approximately 30 degrees (the 'peace sign' rule)",
			"It deflects at 60 degrees",
			"It deflects at 90 degrees",
			"It always rolls directly straight along the initial cue line",
		],
		correctIndex: 0,
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
			"The rebound angle remains mathematically identical regardless of speed",
			"High speed compresses the rail rubber deeper, causing the ball to rebound shorter/stiffer",
			"High speed adds natural topspin that reverses the ball",
		],
		correctIndex: 2,
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
			"Use maximum reverse sidespin to pull the ball off the cushion",
			"Scoop underneath the cue ball to hop it off the rail",
			"Drop the butt of the cue down level with the cloth",
			"Slightly elevate the cue butt so the tip strikes downward cleanly without contacting the wooden rail cap",
		],
		correctIndex: 3,
		explanation: "Slightly elevating the cue butt clears the cushion height, allowing the tip to cleanly strike the cue ball from above without your shaft or ferrule clipping the wooden rail.",
		levelUpAdvice: "Elevate just enough to clear the rail bevel; keep elevation minimal to prevent unintended swerve.",
		videoId: "BVSAVs-rswU",
		videoTitle: "How Cue Elevation Fixes Rail Cuts"
	},
	{
		id: "t2-q4",
		tier: 2,
		fargoMin: 455,
		fargoMax: 500,
		tierTitle: "Level 2: Angles & Rail Rebounds (Fargo 425 - 500)",
		question: "How does the '2-to-1 Diamond System' work for aiming one-rail bank shots?",
		scenario: "You have an object ball midway down the table and want to bank it across into the opposite side pocket.",
		options: [
			"Hit 2 tips of sidespin for every 1 diamond of distance",
			"Aim at a rail diamond halfway between the ball's position and the target pocket",
			"Aim 2 diamonds past the corner pocket",
			"Double the speed of your normal stroke",
		],
		correctIndex: 1,
		explanation: "In standard one-rail diamond banking, aiming at the rail point halfway between the object ball and the pocket creates an equal-angle rebound that guides the ball directly into the target pocket.",
		levelUpAdvice: "Use diamond halfway marks for quick eyeball calculations on one-rail cross-table banks.",
		videoId: "7gsc27OYIUA",
		videoTitle: "How the 2 to 1 Diamond System Works"
	},
	{
		id: "t2-q5",
		tier: 2,
		fargoMin: 465,
		fargoMax: 500,
		tierTitle: "Level 2: Angles & Rail Rebounds (Fargo 425 - 500)",
		question: "Why do dead-straight shots get missed more frequently than expected by intermediate players?",
		scenario: "You have a straight-in 6-foot shot with zero cut angle.",
		options: [
			"The cue ball always swerves on straight shots",
			"Pockets shrink on straight shots due to cushion angle",
			"Any microscopic lateral head or cue twitch throws the ball completely offline, having zero cut tolerance",
			"Straight shots require 5 times more chalk",
		],
		correctIndex: 2,
		explanation: "On cut shots, player focus is hyper-alert to the contact point. On straight shots, players relax their alignment, and even a 0.5mm tip steer or early head lift immediately clips the pocket facing.",
		levelUpAdvice: "Stay down and keep your head motionless for one full beat after striking straight-in shots.",
		videoId: "0EPMTZvFD5U",
		videoTitle: "Straight Shots Are the Easiest to Miss Heres Why"
	},
	{
		id: "t2-q6",
		tier: 2,
		fargoMin: 475,
		fargoMax: 500,
		tierTitle: "Level 2: Angles & Rail Rebounds (Fargo 425 - 500)",
		question: "How does the '45-Degree Rule' help you navigate the cue ball toward center-table position?",
		scenario: "You are pocketing a ball in the corner and want the cue ball to rebound comfortably to the middle of the table.",
		options: [
			"Elevating your bridge 45mm locks position",
			"Sending the cue ball into a corner pocket area at approximately 45 degrees naturally rebounds it toward table center",
			"Striking at a 45-degree cue elevation spins the ball to center",
			"Rolling balls at 45 mph creates center spin",
		],
		correctIndex: 1,
		explanation: "When the cue ball hits a cushion near the corner at roughly 45°, the two-rail rebound path naturally tracks diagonally across the center of the table, the safest position zone in pool.",
		levelUpAdvice: "Target center-table 45° paths when playing position; center table offers the most options.",
		videoId: "3sv26c0ALps",
		videoTitle: "How the 45 Degree Rule Finds Center Table"
	},
	{
		id: "t2-q7",
		tier: 2,
		fargoMin: 485,
		fargoMax: 500,
		tierTitle: "Level 2: Angles & Rail Rebounds (Fargo 425 - 500)",
		question: "How does the 'Stop-and-Hide' safety turn an offensive dry spell into a winning position?",
		scenario: "You have no makable offensive shot, but one of your balls is near a cluster.",
		options: [
			"You shoot the cue ball off the table",
			"You deliberately scratch in the corner",
			"You execute a simple stop shot that hides the cue ball directly behind your own ball, blocking your opponent's sight line",
			"You hide your cue stick under the table",
		],
		correctIndex: 2,
		explanation: "The Stop-and-Hide uses the easiest shot in pool (the stop shot) to bury the cue ball behind a blocker ball, taking away your opponent's offense without risking complex rail speed calculations.",
		levelUpAdvice: "When out of position, look for a simple stop-and-hide behind your own balls rather than forcing a low-percentage bank.",
		videoId: "i0qp5VLeRFU",
		videoTitle: "How the Stop and Hide Wins Games"
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
			"It increases the cue tip diameter dynamically",
			"It eliminates all friction between the ball and cloth",
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
			"It forces the object ball to bank off two rails",
			"Backspin causes the ball to jump slightly over chalk spots",
			"Backspin increases the diameter of the pocket",
			"The firm hit ensures a clean, confident stroke, while backspin scrubs off speed against the cloth and converts to a soft roll at contact",
		],
		correctIndex: 3,
		explanation: "A drag shot allows a firm, accelerated stroke (eliminating steering twitches). The backspin fights the cloth friction, bleeding speed over the journey and reaching the ball as a gentle, controllable roll.",
		levelUpAdvice: "Replace timid, 'baby' strokes on long shots with a firm drag stroke for pinpoint speed control.",
		videoId: "vSOP6wZLzRY",
		videoTitle: "How the Drag Shot Controls the Cue Ball"
	},
	{
		id: "t3-q3",
		tier: 3,
		fargoMin: 525,
		fargoMax: 575,
		tierTitle: "Level 3: Cue Ball Physics & Safeties (Fargo 500 - 575)",
		question: "What is a 'two-way shot' and why is it a staple of high-level tournament play?",
		scenario: "You have a tough cut shot that carries significant risk of missing.",
		options: [
			"Playing an offensive pot while intentionally directing the cue ball to a defensive safe zone if the shot misses",
			"Switching between your dominant and non-dominant hand",
			"Hitting a bank shot that can go into either of two pockets",
			"Pocketing two balls on a single stroke",
		],
		correctIndex: 0,
		explanation: "A two-way shot eliminates downside. If the ball drops, you keep shooting; if it misses, your cue ball speed and direction leave your opponent snookered or trapped on the rail.",
		levelUpAdvice: "On any cut with under 80% confidence, choose a speed and cue ball route that leaves a safety if you miss.",
		videoId: "5zwMQyJ5bAU",
		videoTitle: "The Shot That Wins Even When You Miss"
	},
	{
		id: "t3-q4",
		tier: 3,
		fargoMin: 535,
		fargoMax: 575,
		tierTitle: "Level 3: Cue Ball Physics & Safeties (Fargo 500 - 575)",
		question: "How does the 'Pocket Blocker' strategy lock down a game of 8-ball?",
		scenario: "Your opponent has multiple balls aiming into a specific corner pocket.",
		options: [
			"You deliberately leave your object ball parked in the mouth of that pocket, closing it off to opponent shots",
			"You call a pocket blocker time-out",
			"You place your chalk in the pocket jaw",
			"You jump the cue ball into the pocket",
		],
		correctIndex: 0,
		explanation: "Parking one of your balls directly in the jaws of a key pocket denies your opponent access to it, forcing them into difficult banks or unnatural position routes.",
		levelUpAdvice: "Identify your opponent's favorite pockets and park blocker balls in their jaws early in the rack.",
		videoId: "dcsBhOgl6wU",
		videoTitle: "How the Pocket Blocker Strategy Wins Pool Games"
	},
	{
		id: "t3-q5",
		tier: 3,
		fargoMin: 545,
		fargoMax: 575,
		tierTitle: "Level 3: Cue Ball Physics & Safeties (Fargo 500 - 575)",
		question: "In the 'No-Cushion Challenge' practice drill, what skill is intensely tested?",
		scenario: "You play a drill where the cue ball is never permitted to touch any cushion.",
		options: [
			"Masse curves",
			"Diamond kick calculations",
			"Micro-speed control and soft touch, forcing you to play precision position in the open table",
			"Max power jumping",
		],
		correctIndex: 2,
		explanation: "The No-Cushion rule strips away the crutch of relying on rails to catch an over-hit cue ball, demanding surgical speed control within 6-inch target zones.",
		levelUpAdvice: "Practice running 3-ball patterns without letting the cue ball touch a rail to calibrate soft touch.",
		videoId: "ii7BxSgL8bo",
		videoTitle: "The Practice Game With One Weird Rule"
	},
	{
		id: "t3-q6",
		tier: 3,
		fargoMin: 555,
		fargoMax: 575,
		tierTitle: "Level 3: Cue Ball Physics & Safeties (Fargo 500 - 575)",
		question: "When you cut an object ball into a rail, how does 'transferred spin' alter the bank rebound?",
		scenario: "You cut an object ball to the right into the cushion with left English on the cue ball.",
		options: [
			"Transferred spin has zero effect on the object ball",
			"Friction transfers reverse spin to the object ball, causing it to rebound shorter/steeper off the cushion",
			"The object ball slides instead of rolls",
			"It causes the rail to jump",
		],
		correctIndex: 1,
		explanation: "When two balls collide with spin or at an angle, friction transfers opposite spin to the object ball. Transferred running or check spin changes the rebound angle off the rail noticeably.",
		levelUpAdvice: "Account for transferred spin on banks whenever cutting the object ball into the rail.",
		videoId: "6qpNKPrg8HA",
		videoTitle: "How Transferred Spin Shortens Bank Shots"
	},
	{
		id: "t3-q7",
		tier: 3,
		fargoMin: 565,
		fargoMax: 575,
		tierTitle: "Level 3: Cue Ball Physics & Safeties (Fargo 500 - 575)",
		question: "Why do top players use the '2nd-Ball Break' in 8-ball?",
		scenario: "Breaking from the side rail rather than hitting the head ball head-on.",
		options: [
			"It guarantees a scratch on every break",
			"It is required by World Pool-Billiard Association rules",
			"It reduces break speed to 10 mph",
			"It drives the 8-ball toward the opposite side pocket and parks the cue ball near table center",
		],
		correctIndex: 3,
		explanation: "The second-ball break hits the second row of the rack from the side rail, transferring direct momentum into the 8-ball toward the side pocket while squatting the cue ball in the middle.",
		levelUpAdvice: "Add the 2nd-ball break to your 8-ball arsenal for higher 8-on-the-break percentages and safe cue ball parking.",
		videoId: "iXnRycM2SvY",
		videoTitle: "How the 2nd Ball Break Sinks the 8 Ball"
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
			"Throw only occurs if the cue ball has sidespin applied",
			"It causes the object ball to draw backwards",
			"Friction between balls grips and pushes the object ball offline, causing it to hit thick/undercut",
		],
		correctIndex: 3,
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
			"When you can gently tie up their key ball into an intractable cluster, denying them an out even with ball-in-hand",
			"Whenever you are behind on the scoreboard",
			"Only when the shot clock drops under 10 seconds",
			"Never, because giving ball-in-hand guarantees a loss",
		],
		correctIndex: 0,
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
			"You must stroke with 4 times your normal bridge length",
			"The object ball will rebound off 4 cushions",
			"Draw distance will be 4 times greater than follow distance",
			"The cue ball's draw path can curve into a pocket at roughly 4 times the angle of separation if over-drawn",
		],
		correctIndex: 3,
		explanation: "The 4X rule models the parabolic curve of draw. A spinning cue ball initial arcs out along the tangent line before backspin bites and pulls it back sharply, often heading straight into corner pockets.",
		levelUpAdvice: "Anticipate the curved arc of your draw shots rather than assuming a straight bounce line.",
		videoId: "a34eiwcuo4E",
		videoTitle: "How the 4X Rule Prevents Draw Scratches"
	},
	{
		id: "t4-q4",
		tier: 4,
		fargoMin: 610,
		fargoMax: 650,
		tierTitle: "Level 4: Master Tactical Play (Fargo 575 - 650)",
		question: "How does the 'Plus System' calculate two-rail kick escapes when hooked behind a cluster?",
		scenario: "You are snookered and must kick off the short rail, then the long rail, to contact a hidden ball.",
		options: [
			"It requires maximum draw on all kicks",
			"It adds the cue ball diamond number to the origin number to calculate the target rail diamond",
			"It multiplies the diamond number by 3",
			"It calculates the difference in cloth friction",
		],
		correctIndex: 1,
		explanation: "The Plus System uses rail diamond indexing where (Origin Diamond + Target Diamond = Destination Diamond) to navigate two-rail kicks out of severe snookers with mathematical certainty.",
		levelUpAdvice: "Learn the Plus System diamond formula to turn hopeless snookers into reliable escape hits.",
		videoId: "F9ZldUSxWQ8",
		videoTitle: "How to Escape a Hook Using Diamonds"
	},
	{
		id: "t4-q5",
		tier: 4,
		fargoMin: 620,
		fargoMax: 650,
		tierTitle: "Level 4: Master Tactical Play (Fargo 575 - 650)",
		question: "What makes a jump shot legal under WPA/BCA rules versus an illegal foul?",
		scenario: "An opponent ball completely obstructs the path to your object ball.",
		options: [
			"The cue tip must strike downward into the top hemisphere to compress the ball into the slate; scooping underneath is a foul",
			"Both player feet must be off the floor during the jump",
			"The jump cue must be heavier than 25oz",
			"Jump shots are only legal in 9-ball, never 8-ball",
		],
		correctIndex: 0,
		explanation: "A legal jump strikes downward onto the ball, compressing it against the slate bed which rebounds the ball upward. Scooping underneath is an illegal double-hit and cloth-damaging foul.",
		levelUpAdvice: "Elevate your jump cue to 45°-60° and strike down cleanly through the cue ball; never scoop from below.",
		videoId: "vY6iI9up_YA",
		videoTitle: "Jump Shots How to Actually Aim Them"
	},
	{
		id: "t4-q6",
		tier: 4,
		fargoMin: 630,
		fargoMax: 650,
		tierTitle: "Level 4: Master Tactical Play (Fargo 575 - 650)",
		question: "What is the 'Chaos Zone' concept in progressive practice drills?",
		scenario: "You are running the straight-in or progressive draw drill.",
		options: [
			"The random spin imparted by dirty chalk",
			"The noise level inside a crowded pool room",
			"The exact distance or difficulty threshold where your success rate drops from 80% to 50%, marking your true learning edge",
			"The area around the pockets where balls rattle",
		],
		correctIndex: 2,
		explanation: "Your Chaos Zone is the boundary where control begins to break down. Training at this specific threshold produces 3-4x faster skill acquisition than practicing easy shots you can already make.",
		levelUpAdvice: "Identify your Chaos Zone distance on draw and cut shots, and spend 80% of your solo practice right at that boundary.",
		videoId: "8r-o5pKRJak",
		videoTitle: "How Progressive Practice Maps Your Chaos Zone"
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
			"A subtle adrenaline surge accelerates heart rate and internal pacing, prompting the trigger before eyes and body settle into quiet stillness",
			"Chalk loses electrostatic attraction during long matches",
			"Cloth temperature drops rapidly during championship matches",
			"The cue tip compresses permanently on pressure shots",
		],
		correctIndex: 0,
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
			"Hitting the table cloth first to cushion the tip",
			"Striking with a whip-like snap and elevated angle so tip contact terminates before the cue ball rebounds back into the tip",
			"Shooting with maximum speed so the balls separate instantaneously",
			"Pushing through both balls simultaneously",
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
			"Pros look exclusively at their bridge hand to check cue alignment",
		],
		correctIndex: 1,
		explanation: "The 'Quiet Eye' phenomenon shows that elite shooters lock their gaze on the specific contact point without darting or shifting during the final pause and delivery, creating optimal neural aim calibration.",
		levelUpAdvice: "Hold your gaze motionless on the contact spot for one full second before starting your final stroke.",
		videoId: "bIhBDDQMwoA",
		videoTitle: "How Quiet Eyes Lock Your Aim"
	},
	{
		id: "t5-q4",
		tier: 5,
		fargoMin: 680,
		fargoMax: 750,
		tierTitle: "Level 5: Elite & Pro Mastery (Fargo 650+)",
		question: "When applying sidespin with an elevated cue (above 15°), what aerodynamic & friction force causes the cue ball path to curve (swerve)?",
		scenario: "You're shooting with right English over a cluster of balls with an elevated cue butt.",
		options: [
			"The rail rubber magnetic field attracts the ball",
			"Air resistance pushes the ball sideways",
			"Cloth humidity creates static electricity",
			"Downward vertical spin bites into the cloth nap, steering the ball in an arc in the direction of the sidespin",
		],
		correctIndex: 3,
		explanation: "Elevating the cue adds a downward force component to the sidespin. When the ball rolls across the cloth nap, friction grabs the spin axis and causes the cue ball to swerve in an arc, requiring reverse aim compensation.",
		levelUpAdvice: "Account for swerve curvature whenever elevating your cue stick with sidespin.",
		videoId: "FJdxD7pUa3A",
		videoTitle: "Why Your Sidespin Shots Curve"
	},
	{
		id: "t5-q5",
		tier: 5,
		fargoMin: 690,
		fargoMax: 750,
		tierTitle: "Level 5: Elite & Pro Mastery (Fargo 650+)",
		question: "How does a rigid pre-shot rhythm silence the 'Inner Critic' (self-doubt) during championship play?",
		scenario: "A negative internal voice pops into your head right as you are feathering the cue.",
		options: [
			"By loudly arguing with the voice in your head",
			"By closing your eyes during the final stroke",
			"By taking 2 minutes on every shot",
			"By maintaining an automatic, unhurried cadence that engages the subconscious motor cortex and starves the analytical brain of processing time",
		],
		correctIndex: 3,
		explanation: "The Inner Game of pool shows that conscious self-doubt operates through hesitations in cadence. A consistent pre-shot rhythm (e.g. 3 warm-up strokes, set, trigger) lets the subconscious motor mind execute without analytical interference.",
		levelUpAdvice: "Develop an unbroken pre-shot cadence so your body shoots before negative chatter can intervene.",
		videoId: "xOIQqoUwPpg",
		videoTitle: "How Rhythm Silences the Inner Critic"
	}
];

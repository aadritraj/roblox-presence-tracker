import "@std/dotenv/load";

type ThumbnailsBody = {
  data: [
    {
      targetId: number;
      state: string;
      imageUrl: string;
      version: string;
    },
  ];
};

type UserInfo = {
  description: string;
  created: string;
  isBanned: boolean;
  externalAppDisplayName: string;
  hasVerifiedBadge: boolean;
  id: number;
  name: string;
  displayName: string;
};

// this type is missing some info which is unessential or irrelevant
type GamesResponse = {
  data: [
    {
      id: number;
      rootPlaceId: number;
      name: string;
      description: string;
      sourceName: string;
      sourceDescription: string;
      creator: {
        id: number;
        name: string;
        type: string;
        isRNVAccount: boolean;
        hasVerifiedBadge: boolean;
      };
      playing: number;
      visits: number;
      maxPlayers: number;
      created: string;
      updated: string;
      isFavoritedByUser: boolean;
      favoritedCount: number;
    },
  ];
};

type UserPresenceType = {
  [key: number]: string;
};

type UserPresence = {
  userPresenceType: number;
  lastLocation: string;
  placeId: number;
  rootPlaceId: number;
  gameId: string;
  universeId: number;
  userId: number;
  lastOnline: string;
  invisibleModeExpiry: string;
};
const hook: string = Deno.env.get("WEBHOOK_LINK")!;
const robloxCookie: string = Deno.env.get("ROBLOX_COOKIE")!;

// modify this for your use-case
const requestData = {
  userIds: [1],
};
const timespan = 2 * 60 * 1000; // 2 minutes in ms

if (!hook) {
  throw new Error(
    "Webhook not configured! Please configure Enviornment variables",
  );
}

if (!robloxCookie) {
  throw new Error(
    "ROBLOSECURITY not configured! Please configure Enviornment variables",
  );
}

// map for userPresenceType -> string
const userPresenceType: UserPresenceType = {
  0: "Offline",
  1: "Online",
  2: "InGame",
  3: "InStudio",
  4: "Invisible",
};

const getPresence = async () => {
  const presenceEndpoint = "https://presence.roblox.com/v1/presence/users";
  
  const response = await fetch(presenceEndpoint, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "Content-Type": "application/json",
      "Cookie": robloxCookie,
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    throw new Error("WAAAAAAAAAAAA");
  }

  return response.json();
};

const getHeadshot = async (userID: number): Promise<string> => {
  const req = await fetch(
    `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userID}&size=420x420&format=Png&isCircular=false&thumbnailType=HeadShot`,
  );
  const body: ThumbnailsBody = await req.json();

  return body.data[0].imageUrl;
};

const makeEmbed = async (userPresence: UserPresence) => {
  const usersEndpoint = "https://users.roblox.com/v1/users";
  const userHeadshot = await getHeadshot(userPresence.userId);

  const userInfoRequest = await fetch(
    `${usersEndpoint}/${userPresence.userId}`,
  );
  const userInfo: UserInfo = await userInfoRequest.json();

  const lastOnline = new Date(userPresence.lastOnline);

  if (userPresence.gameId) {
    const gamesEndpoint = "https://games.roblox.com/v1/games";

    const gameInfoRequest = await fetch(
      `${gamesEndpoint}?universeIds=${userPresence.universeId}`,
    );
    const gameInfo: GamesResponse = await gameInfoRequest.json();

    return {
      username: userInfo.displayName,
      avatar_url: userHeadshot,
      embeds: [
        {
          title: `${userInfo.displayName} (@${userInfo.name})`,
          thumbnail: {
            url: userHeadshot,
          },
          description:
            "These points of data make a beautiful line. And we're out of beta we're releasing on time!",
          fields: [
            {
              name: "Status",
              value: userPresenceType[userPresence.userPresenceType],
            },
            {
              name: "Last Online",
              value: lastOnline.toLocaleTimeString("en-US"),
            },
            {
              name: `Game (${userPresence.universeId})`,
              value: `${gameInfo.data[0].sourceName}`,
            },
          ],
          color: 0xf51b72,
        },
      ],
    };
  }

  return {
    username: userInfo.displayName,
    avatar_url: userHeadshot,
    embeds: [
      {
        title: `${userInfo.displayName} (@${userInfo.name})`,
        thumbnail: {
          url: userHeadshot,
        },
        description: "Sleepy time is every time! 💤",
        fields: [
          {
            name: "Status",
            value: userPresenceType[userPresence.userPresenceType],
          },
          {
            name: "Last Online",
            value: lastOnline.toLocaleTimeString("en-US"),
          },
        ],
        color: 0x1bf588,
      },
    ],
  };
};

setInterval(async () => {
  const presence = await getPresence();

  for (let i = 0; i < presence.userPresences.length; i++) {
    const userPresence: UserPresence = presence.userPresences[i];

    const embedPayload = await makeEmbed(userPresence);

    fetch(hook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(embedPayload),
    });
  }
}, timespan);

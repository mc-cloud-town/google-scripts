const properties = PropertiesService.getScriptProperties();

const DISCORD_WEBHOOK_URL = properties.getProperty('DISCORD_WEBHOOK_URL');
// const BOT_TOKEN = properties.getProperty('BOT_TOKEN');

export const onFormSubmit = ({
  range,
  namedValues,
}: GoogleAppsScript.Events.SheetsOnFormSubmit & { namedValues: IFormData }) => {
  const data = {
    discordID:
      namedValues['請問您的discord ID？\nWhat is your discord ID?'].shift(),
    introduce:
      namedValues[
        '請給我一段自我介紹。\nPlease shortly introduce yourself?'
      ].shift(),
    arg: namedValues['請問您的年紀？\nHow old are you?'].shift(),
    gender:
      namedValues['請問您的性別？\nWhat is your preferred pronoun?'].shift(),
    minecraftID:
      namedValues['請問您的minecraft ID？\nWhat is your minecraft ID?'].shift(),
    nationality:
      namedValues['請問您的國籍為何？\nWhat is your nationality?'].shift(),
    category:
      namedValues[
        '請問想報考的組別與語言？(選擇將會影響考題)\nWhich category and language are you applying? (Choices will affect questions you get)'
      ].shift(),
    score: namedValues['分數'].shift(),
    ID: range.getRowIndex() - 3,
  };

  const [, score] = data.score?.match(/(\d+) \/ \d+/) || [];

  if (DISCORD_WEBHOOK_URL) {
    UrlFetchApp.fetch(DISCORD_WEBHOOK_URL, {
      method: 'post',
      payload: JSON.stringify({
        embeds: [
          {
            title: `收到一份新的表單 #${data.ID}`,
            color: 0xffa600,
            fields: [
              { name: 'discordID', value: data.discordID, inline: true },
              { name: '國籍', value: data.nationality, inline: true },
              { name: '基礎分數', value: Math.min(+score, 100), inline: true },
              { name: '申請類別', value: data.category, inline: true },
              { name: '年齡', value: data.arg, inline: true },
              { name: '性別', value: data.gender, inline: true },
              { name: 'Minecraft ID', value: data.minecraftID, inline: true },
              {
                name: '自我介紹',
                value: stringSizeRange(data.introduce || '無'),
                inline: true,
              },
            ],
          },
        ],
      }),
      contentType: 'application/json',
    });

    // 403 -> 40333 error, app script system ip Not allowed
    // if (BOT_TOKEN) {
    //   // Add reactions, `O` and `X`
    //   const baseURL = `https://discord.com/api/channels/${msg.channel_id}/messages/${msg.id}/reactions`;
    //   UrlFetchApp.fetch(`${baseURL}/⭕/@me`, {
    //     method: 'put',
    //     headers: { Authorization: `Bot ${BOT_TOKEN}` },
    //   });
    //   UrlFetchApp.fetch(`${baseURL}/❌/@me`, {
    //     method: 'put',
    //     headers: { Authorization: `Bot ${BOT_TOKEN}` },
    //   });
    // }
  }
};

export interface IFormData {
  '請問您的discord ID？\nWhat is your discord ID?': [string];
  '請給我一段自我介紹。\nPlease shortly introduce yourself?': [string];
  '請問您的年紀？\nHow old are you?': [string];
  '請問您的性別？\nWhat is your preferred pronoun?': [string];
  '請問您的minecraft ID？\nWhat is your minecraft ID?': [string];
  '請問您的國籍為何？\nWhat is your nationality?': [string];
  '請問想報考的組別與語言？(選擇將會影響考題)\nWhich category and language are you applying? (Choices will affect questions you get)': [
    string
  ];
  分數: [string];
  時間戳記: [string];
}

export const stringSizeRange = (content: string, max: number = 30) => {
  return content.length > max
    ? content.slice(0, content.length - 3).concat('...')
    : content;
};

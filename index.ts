const properties = PropertiesService.getScriptProperties();

const DISCORD_WEBHOOK_URL = properties.getProperty('DISCORD_WEBHOOK_URL');
const BOT_TOKEN = properties.getProperty('BOT_TOKEN');

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
    nationality:
      namedValues['請問您的國籍為何？\nWhat is your nationality?'].shift(),
    category:
      namedValues[
        '請問想報考的組別？(選擇將會影響考題)\nWhich category are you applying? (Choices will affect questions you get)'
      ].shift(),
    score: namedValues['分數'].shift(),
    ID: range.getRowIndex() - 1,
  };

  console.log(JSON.stringify(data));

  if (DISCORD_WEBHOOK_URL) {
    const url = new URL(DISCORD_WEBHOOK_URL);
    url.searchParams.append('wait', 'true');
    const msg = JSON.parse(
      UrlFetchApp.fetch(url.href, {
        method: 'post',
        payload: JSON.stringify({
          embeds: [
            {
              title: `收到一份新的表單 #${data.ID}`,
              color: 0xffa600,
              fields: [
                { name: 'discordID', value: data.discordID, inline: true },
                { name: '國籍', value: data.nationality, inline: true },
                { name: '基礎分數', value: data.score, inline: true },
                { name: '申請類別', value: data.category, inline: true },
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
      }).getContentText()
    );

    if (BOT_TOKEN) {
      const baseURL = `https://discord.com/api/channels/${msg.channel_id}/messages/${msg.id}/reactions`;
      UrlFetchApp.fetch(`${baseURL}/⭕/@me`, {
        headers: { Authorization: `Bot ${BOT_TOKEN}` },
      });
      UrlFetchApp.fetch(`${baseURL}/❌/@me`, {
        headers: { Authorization: `Bot ${BOT_TOKEN}` },
      });
    }
  }
};

export interface IFormData {
  '請問您的discord ID？\nWhat is your discord ID?': [string];
  '請給我一段自我介紹。\nPlease shortly introduce yourself?': [string];
  '請問您的國籍為何？\nWhat is your nationality?': [string];
  '請問想報考的組別？(選擇將會影響考題)\nWhich category are you applying? (Choices will affect questions you get)': [
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

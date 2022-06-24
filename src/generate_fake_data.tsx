import faker from "faker";
import randomColor from "randomcolor";
import moment from "moment";

export default function generateFakeData(groupCount = 30, itemCount = 1000, daysInPast = 30) {
    let randomSeed = Math.floor(Math.random() * 1000);
    let groups = [];
    for (let i = 0; i < groupCount; i++) {
        groups.push({
            id: `${i + 1}`,
            title: faker.name.firstName(),
            rightTitle: faker.name.lastName(),
            bgColor: randomColor({ luminosity: "light", seed: randomSeed + i })
        });
    }

    let items = [];
    for (let i = 0; i < itemCount; i++) {
        const startDate =
            faker.date.recent(daysInPast).valueOf() + daysInPast * 0.3 * 86400 * 1000;
        const startValue =
            Math.floor(moment(startDate).valueOf() / 10000000) * 10000000;
        const endValue = moment(
            startDate + faker.random.number({ min: 2, max: 20 }) * 15 * 60 * 1000
        ).valueOf();

        const item = {
            id: i + "",
            group: faker.random.number({ min: 1, max: groups.length }) + "",
            title: faker.hacker.phrase(),
            start_time: startValue,
            end_time: endValue,
            className:
                moment(startDate).day() === 6 || moment(startDate).day() === 0
                    ? "item-weekend"
                    : "",
            bgColor: randomColor({
                luminosity: "light",
                seed: randomSeed + i,
                format: "rgba",
                alpha: 0.6
            }),
            selectedBgColor: randomColor({
                luminosity: "light",
                seed: randomSeed + i,
                format: "rgba",
                alpha: 1
            }),
            color: randomColor({ luminosity: "dark", seed: randomSeed + i }),
            itemProps: {
                // these optional attributes are passed to the root <div /> of each item as <div {...itemProps} />
                'data-custom-attribute': 'Random content',
                'aria-hidden': true,
                onDoubleClick: () => { console.log('You clicked double!') },
                className: 'weekend',
                style: {
                    //   background: 'fuchsia'
                    background: randomColor({
                        luminosity: "light",
                        seed: randomSeed + i,
                        format: "rgba",
                        alpha: 1
                    }),
                }
            }
        }
        items.push(item);
    }

    //@ts-ignore
    items = items.sort((a, b) => b - a);

    return { groups, items };
}
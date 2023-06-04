export const fakeHashFunction = (keys: (string | null)[]) => {
    const input = keys.filter((key) => key !== null).join(",");

    return `hash(${input})`
}
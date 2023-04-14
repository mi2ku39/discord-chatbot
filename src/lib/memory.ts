type Memory = {
  role: string;
  content: string;
};

const createPath = (guildId: bigint) =>
  `${Deno.env.get("MEMORY_DIR_PATH")}/${guildId}.json`;

const readMemories = async (guildId: bigint) => {
  const path = createPath(guildId);
  const json = await (async () => {
    try {
      if ((await Deno.stat(path)).isFile) return Deno.readTextFile(path);
      return "[]";
    } catch (_) {
      return "[]";
    }
  })();

  const memories: Memory[] = JSON.parse(json);
  return memories;
};

const writeMemory = (path: string, memories: Memory[]) =>
  Deno.writeTextFile(path, JSON.stringify(memories));

const pushMemory = async (
  guildId: bigint,
  message: { role: string; content: string }
) => {
  const path = createPath(guildId);
  const memories = await readMemories(guildId);
  memories.push(message);
  const memoryNum = parseInt(Deno.env.get("MEMORY_NUM")!);
  if (memories.length > memoryNum) {
    const array = memories.slice(memories.length - memoryNum);
    await writeMemory(path, array);
    return array;
  } else {
    await writeMemory(path, memories);
    return memories;
  }
};

export const Memory = {
  read: readMemories,
  push: pushMemory,
};

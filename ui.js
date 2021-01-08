"use strict";
const React = require("react");
const os = require("os");
const { execSync } = require("child_process");
const { Text, Box } = require("ink");
const platform = os.platform();

// os platform constants
const WINDOWS = "win32";
const LINUX = "linux";

const image = `                                ..,
                    ....,,:;+ccllll
      ...,,+:;  cllllllllllllllllll
,cclllllllllll  lllllllllllllllllll
llllllllllllll  lllllllllllllllllll
llllllllllllll  lllllllllllllllllll
llllllllllllll  lllllllllllllllllll
llllllllllllll  lllllllllllllllllll
llllllllllllll  lllllllllllllllllll
                                   
llllllllllllll  lllllllllllllllllll
llllllllllllll  lllllllllllllllllll
llllllllllllll  lllllllllllllllllll
llllllllllllll  lllllllllllllllllll
llllllllllllll  lllllllllllllllllll
\`'ccllllllllll  lllllllllllllllllll
      \`\`' \\*::  :ccllllllllllllllll
                   \`\`\`\`\`\`\`\`''*::cll
                               \`\`\`\`
`;

const WinImage = () => {
  return <Text color={color}>{image}</Text>;
};

const color = platform === WINDOWS ? "cyan" : "green";

const Info = ({ title, children }) => {
  return (
    <Text>
      <Text color={color}>{title}</Text>: {children}
    </Text>
  );
};

const CPUInfo = () => {
  const cpu = os.cpus();
  const [{ model, speed }] = cpu;
  return (
    <Info title="CPU">{`${model.trim()} (${cpu.length}) @ ${speed}MHz`}</Info>
  );
};

const GPU = () => {
  const gpu =
    platform === WINDOWS
      ? execSync("wmic path win32_VideoController get name")
          .toString()
          .split(os.EOL)[1]
      : null;
  // : platform === LINUX ?
  // execsync("lspci -mm").toString().split(os.EOL);
  return <Info title="GPU">{gpu}</Info>;
};

const User = () => {
  const username = os.userInfo().username;
  const hostname = os.hostname();
  return (
    <Box flexDirection="column">
      <Text>
        <Text color={color}>{username}</Text>@
        <Text color={color}>{hostname}</Text>
      </Text>
      <Text>{Array(1 + username.length + hostname.length).fill("-")}</Text>
    </Box>
  );
};

const Uptime = () => {
  const uptime = os.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / (60 * 60));
  const minutes = Math.floor(((uptime % 86400) / 60) % 60);
  return (
    <Info title="Uptime">{`${days} days, ${hours} hours, ${minutes} mins`}</Info>
  );
};

const Colors = () => {
  const colors = [
    "black",
    "red",
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
    "white",
  ];
  return (
    <Box flexDirection="column">
      <Box marginTop={1}>
        {colors.map((color, key) => (
          <Text key={key} backgroundColor={color}>
            {"   "}
          </Text>
        ))}
      </Box>
      <Text backgroundColor="grey">
        {Array(colors.length).fill("   ").join("")}
      </Text>
    </Box>
  );
};

const megaBytes = (bytes) => Math.floor(bytes / (1024 * 1024));

const App = () => (
  <Box>
    <Box marginRight={2}>
      <WinImage />
    </Box>
    <Box flexDirection="column">
      <User />
      <Info title="OS">{`${os.version()} ${os.arch()}`}</Info>
      <Uptime />
      <CPUInfo />
      <GPU />
      <Info title="Memory">
        {`${megaBytes(os.freemem())}MiB / ${megaBytes(os.totalmem())}MiB`}
      </Info>
      <Colors />
    </Box>
  </Box>
);

module.exports = App;

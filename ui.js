"use strict";
const React = require("react");
const { useEffect, useState } = React;
const os = require("os");
const { Text, Box } = require("ink");
const platform = os.platform();
const util = require("util");
const exec = util.promisify(require("child_process").exec);

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
  return <Text color={color} bold>{image}</Text>;
};

const color = platform === WINDOWS ? "cyan" : "red";

const Info = ({ title, windows, linux, children }) => {
  // pattern mathcing platform. children will be the default case
  const text =
    {
      [WINDOWS]: windows,
      [LINUX]: linux,
    }[platform] || children;
  const [output, setOutput] = useState(typeof text == "string" ? text : "");
  useEffect(() => {
    let mounted = true;
    if (text?.constructor?.name === "Function") setOutput(text());
    else if (text?.constructor?.name === "AsyncFunction")
      text().then((data) => {
        if (mounted) setOutput(typeof data !== "object" ? data : "");
      });
    return () => (mounted = false);
  }, []);
  return (
    <Text>
      <Text color={color} bold>{title}</Text>: {output}
    </Text>
  );
};

const CPUInfo = () => {
  const [cpu] = useState(os.cpus());
  const [{ model, speed }] = cpu;
  return (
    <Info title="CPU">{`${model?.trim()} (${cpu?.length}) @ ${speed}MHz`}</Info>
  );
};

const GPU = () => {
  // : platform === LINUX ?
  // execsync("lspci -mm").toString().split(os.EOL);
  return (
    <Info
      title="GPU"
      windows={async () => {
        const { stdout } = await exec(
          "wmic path win32_VideoController get name"
        );
        return stdout.split(os.EOL)[1];
      }}
      linux={async () => {
        const { stdout } = await exec("lspci -mm");
        return stdout
          .split(os.EOL)
          .filter(cur => cur.match(/vga|geforce/i))[0]
          .match(/"[A-Za-z\s\d\[\]]+"/g)
          .slice(1,3)
          .join(" ")
          .replace(/"/g, "")
      }}
    />
  );
};

const User = () => {
  const { username } = os.userInfo();
  const hostname = os.hostname();
  return (
    <Box flexDirection="column">
      <Text>
        <Text color={color} bold>{username}</Text>@
        <Text color={color} bold>{hostname}</Text>
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

const Shell = () => {
  const nixShell = async () => {
    const { stdout: shell } = await exec("sh --version");
    if (shell.includes("bash")) {
      let { stdout: version } = await exec("bash --version");
      return "bash " + version.match(/\d+\.\d+\.\d+/)[0];
    }
  };
  return (
    <Info
      title="Shell"
      windows={async () => {
        const { stdout } = await exec("Get-Host | Select-Object Version", {
          shell: "powershell",
        });
        return "PowerShell " + stdout.match(/\d+\.\d+\.\d+\.\d+/)[0];
      }}
    />
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

const Resolution = () => (
  <Info
    title="Resolution"
    windows={async () => {
      const values = await Promise.all([
        exec("wmic path Win32_VideoController get CurrentHorizontalResolution"),
        exec("wmic path Win32_VideoController get CurrentVerticalResolution"),
      ]);
      const [x, y] = values.map(({ stdout }) => stdout.match(/\d+/));
      return `${x}x${y}`;
    }}
  />
);

const Host = () => (
  <Info
    title="Host"
    windows={async () => {
      const { stdout } = await exec("wmic computersystem get manufacturer,model");
      return stdout.split(os.EOL)[1];
    }}
  />
);

const megaBytes = (bytes) => Math.floor(bytes / (1024 * 1024));

const App = () => (
  <Box>
    <Box marginRight={2}>
      <WinImage />
    </Box>
    <Box flexDirection="column">
      <User />
      <Info title="OS">{`${os.version()} ${os.arch()}`}</Info>
      <Host />
      <Uptime />
      <Shell />
      <Resolution />
      <Info title="Terminal">
        {process.env.TERM_PROGRAM || process.env.TERM}
      </Info>
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

import {
  Box,
  InputLabel,
  ListItemIcon,
  ListItemText,
  makeStyles,
  MenuItem,
  OutlinedTextFieldProps,
  Select,
  TextField,
} from "@material-ui/core";
import clsx from "clsx";
import {
  ChainId,
  CHAINS as CHAIN_IDS,
} from "../../wallet-packages/wallets/core";
import algorandIcon from "../../icons/algorand.svg";
import ethIcon from "../../icons/eth.svg";
import solanaIcon from "../../icons/solana.svg";
import aptosIcon from "../../icons/aptos.svg";
import suiIcon from "../../icons/sui.svg";
import osmosisIcon from "../../icons/osmosis.svg";
import starsIcon from "../../icons/stargaze.svg";
import seiIcon from "../../icons/sei.svg";

export interface ChainInfo {
  id: ChainId;
  name: string;
  logo: any;
}

const CHAINS = [
  {
    id: CHAIN_IDS["ethereum"],
    name: "Ethereum (Goerli)",
    logo: ethIcon,
  },
  {
    id: CHAIN_IDS["solana"],
    name: "Solana",
    logo: solanaIcon,
  },
  {
    id: CHAIN_IDS["aptos"],
    name: "Apthos",
    logo: aptosIcon,
  },
  {
    id: CHAIN_IDS["sui"],
    name: "Sui",
    logo: suiIcon,
  },
  {
    id: CHAIN_IDS["osmosis"],
    name: "Osmosis",
    logo: osmosisIcon,
  },
  {
    id: CHAIN_IDS["stargaze"],
    name: "Stargaze",
    logo: starsIcon,
  },
  {
    id: CHAIN_IDS["sei"],
    name: "Sei",
    logo: seiIcon,
  },
];
const useStyles = makeStyles((theme) => ({
  select: {
    "& .MuiSelect-root": {
      display: "flex",
      alignItems: "center",
    },
  },
  listItemIcon: {
    minWidth: 40,
  },
  icon: {
    height: 24,
    maxWidth: 24,
  },
}));

const createChainMenuItem = ({ id, name, logo }: ChainInfo, classes: any) => (
  <MenuItem key={id} value={id}>
    <ListItemIcon className={classes.listItemIcon}>
      <img src={logo.src} alt={name} className={classes.icon} />
    </ListItemIcon>
    <ListItemText>{name}</ListItemText>
  </MenuItem>
);

interface MuiChainSelectorProps extends OutlinedTextFieldProps {
  chains?: ChainInfo[];
}

export function MuiChainSelector({
  chains = CHAINS,
  ...rest
}: MuiChainSelectorProps) {
  const classes = useStyles();

  return (
    <Box sx={{ minWidth: 220 }}>
      <TextField {...rest} className="flex flex-row w-[220px]">
        {chains.map((chain) => createChainMenuItem(chain, classes))}
      </TextField>
    </Box>
  );
}

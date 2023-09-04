import { ListItemIcon, ListItemText, makeStyles, MenuItem, TextField } from "@material-ui/core";
import { useCallback, useEffect } from "react";
import { ChainId } from "../../wallet-packages/wallets/core";
import {
  useChangeWallet,
  useWalletsForChain,
} from "../../wallet-packages/react";

interface WalletSelectorProps {
  chainId: ChainId;
}

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

export default function WalletSelector({ chainId }: WalletSelectorProps) {
  const changeWallet = useChangeWallet();
  const wallets = useWalletsForChain(chainId);
  useEffect (()=>{
    changeWallet(wallets[0]);
  }, [chainId]);
  const onChange = useCallback(
    (ev: any) => {
      const walletName = ev.target.value;
      const wallet = wallets.find((w) => w.getName() === walletName);
      if (wallet) changeWallet(wallet);
    },
    [wallets, changeWallet]
  );
  
  const classes = useStyles();
  
  return (
    <TextField select variant="outlined" onChange={onChange}>
      {wallets.map((wallet) => (
        <MenuItem
          key={`wallet-selector-${wallet.getName()}`}
          value={wallet.getName()}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <img src={wallet.getIcon()} alt={wallet.getName()} className={classes.icon} />
          </ListItemIcon>
          <ListItemText>{wallet.getName()}</ListItemText>
        </MenuItem>
      ))}
    </TextField>
  );
}

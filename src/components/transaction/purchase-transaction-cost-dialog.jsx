import React from 'react';
import PropTypes from 'prop-types';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useWalletContext } from 'src/context/wallet-context';
import { octasToMove, formatMoveBalance } from 'src/lib/aptos';

// ----------------------------------------------------------------------

PurchaseTransactionCostDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  simulationResult: PropTypes.shape({
    gas_used: PropTypes.number.isRequired,
    gas_unit_price: PropTypes.number.isRequired,
    total_cost_octas: PropTypes.number.isRequired,
    function: PropTypes.string.isRequired,
  }).isRequired,
  publicationPriceOctas: PropTypes.number.isRequired,
  userBalanceOctas: PropTypes.number,
  loading: PropTypes.bool,
};

export function PurchaseTransactionCostDialog({
  open,
  onClose,
  onConfirm,
  simulationResult,
  publicationPriceOctas,
  userBalanceOctas,
  loading = false,
}) {
  const gasCostOctas = simulationResult.total_cost_octas;
  const totalCostOctas = gasCostOctas + publicationPriceOctas;
  const gasCostMove = octasToMove(gasCostOctas);
  const publicationPriceMove = octasToMove(publicationPriceOctas);
  const totalCostMove = octasToMove(totalCostOctas);
  const { moveBalance } = useWalletContext();
  const moveBalanceNum = typeof moveBalance === 'string' ? parseFloat(moveBalance) : moveBalance;
  const insufficient = moveBalanceNum != null && moveBalanceNum < totalCostMove;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Purchase Cost Breakdown</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          The following costs will be incurred when purchasing this paper.
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">
                  Publication Price
                </TableCell>
                <TableCell align="right">
                  {formatMoveBalance(publicationPriceMove, 2)} Move
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  Gas Cost ({simulationResult.function})
                </TableCell>
                <TableCell align="right">
                  {simulationResult.gas_used} gas × {simulationResult.gas_unit_price} octas
                </TableCell>
                <TableCell align="right">
                  {formatMoveBalance(gasCostMove)} Move
                </TableCell>
              </TableRow>
              <TableRow sx={{ '& td': { fontWeight: 'bold', borderTop: 1, borderColor: 'divider' } }}>
                <TableCell component="th" scope="row">
                  Total Cost
                </TableCell>
                <TableCell align="right">
                  {totalCostOctas} octas
                </TableCell>
                <TableCell align="right">
                  {formatMoveBalance(totalCostMove)} Move
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {moveBalanceNum != null && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Your wallet balance: <strong>{formatMoveBalance(moveBalanceNum)} Move</strong>
            </Typography>
            {insufficient ? (
              <Alert severity="error" sx={{ mt: 1 }}>
                Insufficient funds. You need {formatMoveBalance(totalCostMove - moveBalanceNum)} more Move to proceed.
              </Alert>
            ) : (
              <Alert severity="success" sx={{ mt: 1 }}>
                Sufficient funds available.
              </Alert>
            )}
          </Box>
        )}

        <Typography variant="caption" color="text.secondary">
          Note: Gas cost is an estimation based on simulation. Actual gas costs may vary slightly.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading || (moveBalanceNum != null && insufficient)}
          autoFocus
        >
          {loading ? 'Processing...' : 'Confirm Purchase'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

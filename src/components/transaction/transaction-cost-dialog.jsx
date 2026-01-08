import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';

import { useWalletContext } from 'src/context/wallet-context';
import { octasToMove, formatMoveBalance } from 'src/lib/aptos';

// ----------------------------------------------------------------------

TransactionCostDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  simulationResult: PropTypes.shape({
    mint_capability: PropTypes.shape({
      gas_used: PropTypes.number.isRequired,
      gas_unit_price: PropTypes.number.isRequired,
      total_cost_octas: PropTypes.number.isRequired,
      function: PropTypes.string.isRequired,
    }).isRequired,
    publish: PropTypes.shape({
      gas_used: PropTypes.number.isRequired,
      gas_unit_price: PropTypes.number.isRequired,
      total_cost_octas: PropTypes.number.isRequired,
      function: PropTypes.string.isRequired,
    }).isRequired,
    total_gas_cost_octas: PropTypes.number.isRequired,
  }).isRequired,
  userBalanceOctas: PropTypes.number,
  loading: PropTypes.bool,
};

export function TransactionCostDialog({
  open,
  onClose,
  onConfirm,
  simulationResult,
  userBalanceOctas,
  loading = false,
}) {
  const totalCostOctas = simulationResult.total_gas_cost_octas;
  const totalCostMove = octasToMove(totalCostOctas);
  const { moveBalance } = useWalletContext();
  console.log('moveBalance', moveBalance, 'totalCostOctas', totalCostOctas, 'totalCostMove', totalCostMove, 'moveBalance < totalCostMove', moveBalance < totalCostMove);
  const moveBalanceNum = typeof moveBalance === 'string' ? parseFloat(moveBalance) : moveBalance;
  const insufficient = moveBalanceNum != null && moveBalanceNum < totalCostMove;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transaction Cost Breakdown</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          The following gas costs will be incurred when publishing this paper.
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">
                  Mint Capability
                </TableCell>
                <TableCell align="right">
                  {simulationResult.mint_capability.gas_used} gas × {simulationResult.mint_capability.gas_unit_price} octas
                </TableCell>
                <TableCell align="right">
                  {formatMoveBalance(octasToMove(simulationResult.mint_capability.total_cost_octas))} Move
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  Publish
                </TableCell>
                <TableCell align="right">
                  {simulationResult.publish.gas_used} gas × {simulationResult.publish.gas_unit_price} octas
                </TableCell>
                <TableCell align="right">
                  {formatMoveBalance(octasToMove(simulationResult.publish.total_cost_octas))} Move
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
          Note: This is an estimation based on simulation. Actual gas costs may vary slightly.
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
          {loading ? 'Processing...' : 'Confirm & Publish'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

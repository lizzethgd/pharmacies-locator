import React from 'react';
import {Card, CardContent, Typography, IconButton, Collapse, makeStyles} from '@material-ui/core' 
import {Phone, ExpandMore, TransferWithinAStation} from '@material-ui/icons';
import { useState} from "react"
import clsx from 'clsx';
import numeral from "numeral";

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 250,
  },
  title: {
    fontSize: 15,
  },
  pos: {
    marginBottom: 10,
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
}))

const CardInfo = ({name, openinHours, phone, addres, houseNumero, postalCode, city, web, distance}) => {
  
    const classes = useStyles();

    const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
      setExpanded(!expanded);
    }; 
    
  return (
    <Card className={classes.root} variant="outlined" style={{ backgroundColor: '#fceeac' }}>
      <CardContent>
      <Typography variant="h5" component="h2">
          {name} 
        </Typography>
        <Typography className={classes.title} color="textPrimary" gutterBottom>
          {openinHours}
        </Typography>
        <IconButton
          className={clsx(classes.expand, {
            [classes.expandOpen]: expanded,
          })}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
          style={{ color: 'green' }}
        >
          <ExpandMore/>
        </IconButton>
        </CardContent>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
        <Typography className={classes.pos} color="textPrimary">
        <Phone style={{ color: 'green'}} fontSize="small"/> {phone}
        </Typography>
        <Typography className={classes.pos} color="textPrimary">
          {addres} {houseNumero}
        </Typography>
        <Typography className={classes.pos} color="textPrimary">
          {postalCode} {city}
        </Typography>
        <Typography className={classes.pos} color="textPrimary">
          {web}
        </Typography>
        <Typography className={classes.pos} color="textPrimary">
        <TransferWithinAStation style={{ color: 'green' }} fontSize="small"/> {numeral(distance).format('0.00')} km
        </Typography>
        </CardContent>
      </Collapse>

    </Card>
  );
}

export default CardInfo
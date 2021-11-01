import React from 'react';
import {Card, CardContent, Typography, IconButton, Collapse, makeStyles} from '@material-ui/core' 
import {Phone, ExpandMore, TransferWithinAStation} from '@material-ui/icons';
import { useState} from "react"
import clsx from 'clsx';
import numeral from "numeral";
import ButtonGo from './ButtonGo'

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 250,
  },
  title: {
    fontSize: 15,
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
  }

}))

const CardInfo = ({name, openinHours, phone, addres, houseNumero, postalCode, city, web, distance, goToSingleLocation, longitude, latitude}) => {
  
    const classes = useStyles();

    const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
      setExpanded(!expanded);
    }; 
    
  return (
    <Card className={classes.root} variant="outlined" style={{ backgroundColor: '#06235f', color:  '#fff', padding: '0px', marginBottom: '0.5em', borderRadius: '8px'}}>
      <CardContent style={{  padding: '3px 0 0'}}>
      <Typography variant="h5" component="h2">
          {name} 
        </Typography>
        <Typography className={classes.title} color="inherit" gutterBottom>
          {openinHours}
        </Typography>
        <IconButton
          className={clsx(classes.expand, {
            [classes.expandOpen]: expanded,
          })}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
          style={{ color: '#39FF14', padding: '0 0 0.5px' }}
        >
          <ExpandMore/>
        </IconButton>
        </CardContent>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent style={{ padding: '0 0 0.5px'}}>
        <Typography className={classes.pos} color="inherit">
        {phone ?  <Phone style={{ color: '#39FF14'}} fontSize="small"/> : null } {phone}
        </Typography>
        <Typography className={classes.pos} color="inherit">
          {addres} {houseNumero}
        </Typography>
        <Typography className={classes.pos} color="inherit">
          {postalCode} {city}
        </Typography>
        <a style={{ color: '#39FF14'}} target="_blank" rel="noreferrer" href={web}>{web}</a> 
        <Typography className={classes.pos} color="inherit">
        <TransferWithinAStation style={{ color: '#39FF14' }} fontSize="small"/> {numeral(distance).format('0.00')} km
        <ButtonGo longitude={longitude} latitude={latitude} handleClick={goToSingleLocation}/>
        </Typography>
        </CardContent>
      </Collapse>

    </Card>
  );
}

export default CardInfo
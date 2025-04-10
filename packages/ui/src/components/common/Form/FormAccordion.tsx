import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { ExpandMore as ExpandIcon } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

const useStyles = makeStyles()((theme) => ({
  container: {
    marginBottom: theme.spacing(2),
  },
  children: {
    flexDirection: 'column',
    padding: 0,
  },
  title: {
    color: theme.palette.text.secondary,
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
    fontWeight: 400,
    padding: 0,
  },
}));

interface OwnProps {
  title: React.ReactNode;
}

const FormAccordion: React.FC<OwnProps> = ({ children, title }) => {
  const { classes } = useStyles();

  return (
    <Accordion classes={{ root: classes.container }}>
      <AccordionSummary classes={{ root: classes.title }} expandIcon={<ExpandIcon />}>
        {title}
      </AccordionSummary>
      <AccordionDetails classes={{ root: classes.children }}>{children}</AccordionDetails>
    </Accordion>
  );
};

export default FormAccordion;

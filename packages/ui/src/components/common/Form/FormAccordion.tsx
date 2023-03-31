import { Accordion, AccordionDetails, AccordionSummary, Theme, createStyles } from '@material-ui/core';
import { ExpandMore as ExpandIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import * as React from 'react';

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    container: {
      marginBottom: '20px !important',
      marginTop: '20px !important',
    },
    children: {
      flexDirection: 'column',
      padding: 0,
    },
    icon: {
      margin: 0,
    },
    title: {
      color: theme.palette.text.secondary,
      fontSize: 16,
      fontWeight: 400,
      padding: 0,
    },
  }),
);

interface OwnProps {
  title: React.ReactNode;
}

const FormAccordion: React.FC<OwnProps> = ({ children, title }) => {
  const styles = useStyles();

  return (
    <Accordion classes={{ root: styles.container }}>
      <AccordionSummary classes={{ root: styles.title, expandIcon: styles.icon }} expandIcon={<ExpandIcon />}>
        {title}
      </AccordionSummary>
      <AccordionDetails classes={{ root: styles.children }}>{children}</AccordionDetails>
    </Accordion>
  );
};

export default FormAccordion;

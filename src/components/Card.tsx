import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';

// need to add skelaton

function TileCard({title="",data="",onClick=()=>{}}) {

  return (
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
        gap: 2,
      }}
      onClick={onClick}
    >

        <Card>
          <CardActionArea
     
            sx={{
              height: '100%',
              '&[data-active]': {
                backgroundColor: 'action.selected',
                '&:hover': {
                  backgroundColor: 'action.selectedHover',
                },
              },
            }}
          >
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h5" component="div">
                {title}
              </Typography>
              <Typography variant="h2" color="text.secondary">
                {data}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>

    </Box>
  );
}

export default TileCard;

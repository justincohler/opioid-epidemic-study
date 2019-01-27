# library
library(tidyverse)
library(geojsonio)
library(here)
library(RColorBrewer)
library(cartogram)
library(broom)
library(rgeos)
library(mapproj)
library(dplyr)
library(rmarkdown)
library(tidyverse)
library(here)
library(ggrepel)
library(viridis)
library(lubridate)
library(gghighlight)
library(ggthemes)
library(extrafont)
library(devtools)
library(scales)
library(openintro)
library(gganimate)
library(gifski)
library(gapminder)
library(png)

# Load Medicaid Opioid Prescription Data
DRUG_NAMES <- c("VICODIN", "OXYCODONE", "OXYCONTIN", "PERCOCET", 
                "OPANA", "KADIAN", "AVINZA", "FENTANYL")

fname_drug_utilization <- "State_Drug_Utilization_Data_"
df_util <- read_csv(here::here("data", paste(fname_drug_utilization, "2008", ".csv", sep=""))) %>% filter(`Product Name` %in% DRUG_NAMES)
for (i in 2009:2018) {
  df_util <- rbind(df_util, read_csv(here::here("data", paste(fname_drug_utilization, i, ".csv", sep=""))) %>% filter(`Product Name` %in% DRUG_NAMES)) 
}
df_util$StateName <- abbr2state(df_util$State)

# Pop Per State Data (source: https://www.census.gov/data/tables/2017/demo/popest/nation-total.html)
pop=read.table("https://www.r-graph-gallery.com/wp-content/uploads/2018/01/pop_US.csv", sep=",", header=T)
pop$State <- state2abbr(pop$ï..state)
pop$StateName <- pop$ï..state

# Drug Overdoses
DATA_OVERDOSE <- "VSRR_Provisional_Drug_Overdose_Death_Counts.csv"
df_od <- read_csv(here::here("data", DATA_OVERDOSE))
df_od$Date <- parse_date_time(paste(tolower(df_od$Month), df_od$Year), orders=c("by"))
df_od$NumDeaths <- df_od$`Data Value`
df_od <- df_od %>% filter(`Indicator`=='Number of Deaths' & `State` != 'US')
df_od <- df_od %>% left_join(., pop, by=c("State"="State"))
df_od$FatalitiesPer <- df_od$`Data Value`*100000/df_od$pop

df_ods_by_state_year <- df_od %>% filter(Year == 2018)
glimpse(df_ods_by_state_year)
df_ods_by_state_year <- aggregate(df_ods_by_state_year$FatalitiesPer, by=list(df_ods_by_state_year$StateName), FUN="sum", na.rm=TRUE)

df_ods_by_state_year$StateName <- df_ods_by_state_year$Group.1
#df_ods_by_state_year$Year <- df_ods_by_state_year$Group.2
df_ods_by_state_year$FatalitiesPer <- df_ods_by_state_year$x

#df_ods <- df_ods_by_state_year %>% select(StateName, Year, FatalitiesPer100k)
df_ods <- df_ods_by_state_year %>% select(StateName, FatalitiesPer)

glimpse(df_ods)

# Hexbin available in the geojson format here: https://team.carto.com/u/andrew/tables/andrew.us_states_hexgrid/public/map. Download it and load it in R:
spdf <- geojson_read(here::here("data", "us_states_hexgrid.geojson"),  what = "sp")

spdf@data = spdf@data %>% mutate(google_name = gsub(" \\(United States\\)", "", google_name)) 
glimpse(spdf@data)

# merge drug overdose data
spdf@data = spdf@data %>% left_join(., df_ods, by=c("google_name"="StateName"))

glimpse(spdf@data)
# Compute the cartogram, using this population information
glimpse(spdf)
cartogram <- cartogram_cont(spdf, 'FatalitiesPer')


# First look!
plot(cartogram)

# tidy data to be drawn by ggplot2 (broom library of the tidyverse)
carto_fortified <- tidy(cartogram, region = "google_name")
carto_fortified = carto_fortified %>% left_join(. , cartogram@data, by=c("id"="google_name")) 

glimpse(carto_fortified)

#================================================================================
carto_fortified$id=seq(1,nrow(carto_fortified))
afr_df$id=seq(1,nrow(afr_df))

# Bind both map info in a data frame. 3 states: map --> cartogram --> map
data=rbind(afr_df, afr_cartogram_df, afr_df)

# Set transformation type + time
data$ease="cubic-in-out"
data$time=rep(c(1:3), each=nrow(afr_df))

# Calculate the transition between these 2 objects?
dt <- tween_elements(data, time='time', group='id', ease='ease', nframes = 30)
#================================================================================


# Calculate the position of state labels
centers <- cbind.data.frame(data.frame(gCentroid(cartogram, byid=TRUE), id=cartogram@data$iso3166_2))

brewer.pal.info

# plot
ggplot() +
  geom_polygon(data = carto_fortified, aes(fill = FatalitiesPer, x = long, y = lat, group = group) , size=0.05, alpha=0.9, color="black") +
  scale_fill_gradientn(colours=brewer.pal(11,"Spectral"), name="Overdose Deaths (per 100,000 population)", guide=guide_legend( keyheight = unit(3, units = "mm"), keywidth=unit(12, units = "mm"), title.position = 'top', label.position = "bottom") ) +
  geom_text(data=centers, aes(x=x, y=y, label=id), color="#333333", size=3, alpha=0.6) +
  theme_void() +
  ggtitle( "Where Deaths Strike Hardest" ) +
  theme(
    legend.position = c(0.5, 0.9),
    legend.direction = "horizontal",
    text = element_text(color = "#333333"),
    plot.background = element_rect(fill = "#f5f5f9", color = NA), 
    panel.background = element_rect(fill = "#f5f5f9", color = NA), 
    legend.background = element_rect(fill = "#f5f5f9", color = NA),
    plot.title = element_text(size= 22, hjust=0.5, color = "#333333", margin = margin(b = -0.1, t = 0.4, l = 2, unit = "cm")),
  ) +
  coord_map() +
  transition_time(Year) +
  ease_aes('linear')


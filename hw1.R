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
install.packages("fiftystater")

library(installr)
updateR()

bg_color <- "#7A777A"
text_color <- "#EEEEEE"
grid_color <- "#BBBBBB"

fonttable()
fonts()

loadfonts()

jtheme <- theme_bw() + theme(
  text = element_text(family="Quick", color = text_color),
  
  # Plot 
  plot.background = element_rect(fill=bg_color),
  plot.title = element_text(fontface="bold"),
  
  # Legend
  legend.text = element_text("Consolas"),
  legend.title = element_text(fontface="bold"),
  legend.background = element_rect(fill=bg_color),
  legend.key = element_rect(fill=bg_color),
  
  
  # Axes
  axis.line =  element_line(colour=grid_color),
  axis.text = element_text(family="Consolas", colour=text_color),
  axis.text.x.bottom = element_text(margin=margin(10, 10, 10, 10)),
  axis.text.y.left = element_text(margin=margin(10, 10, 10, 10)),
  
  #axis.title = element_text(family="Quick"),
  axis.line.x.bottom = element_blank(),
  axis.line.y.left = element_blank(),
  axis.ticks.x = element_line(colour=grid_color),
  axis.ticks.y = element_line(colour=grid_color),
  
  # Panels
  panel.background = element_rect(fill=bg_color),
  panel.border = element_blank(),
  panel.grid.major.x = element_line(colour=grid_color),
  panel.grid.major.y = element_line(colour=grid_color),
  panel.grid.minor.x = element_blank(),
  panel.grid.minor.y = element_blank()
)


p1 <- ggplot(df_od, aes(x=Date, y=`FatalitiesPerCap`, group=`StateName`, colour=`StateName`)) +
  geom_line() +
  gghighlight(max_highlight = 8L, max(`FatalitiesPerCap`),  use_direct_label=FALSE, label_key=`FatalitiesPerCap`) +
  labs(title="West Virginia's Opioid Problem Stands\nIn Stark Contrast to Rest of Country", 
       subtitle = "Drug Overdoses Per Capita From the Previous 5 Years",
       caption="National Center for Health Statistics",
       x="Date", y="% Fatal Drug Overdoses Per Capita") +
  jtheme

p1

scale_color_manual(values=c("1"="#41B3A3", "2"="#E27D60", "3"="#C38D9E", "4"="#E8A87C", "5"="#85DCB"))
scale_fill_manual(values=c("1"="#41B3A3", "2"="#E27D60", "3"="#C38D9E", "4"="#E8A87C", "5"="#85DCB"))


fonts()


# Pop Per State Data (source: https://www.census.gov/data/tables/2017/demo/popest/nation-total.html)
pop=read.table("https://www.r-graph-gallery.com/wp-content/uploads/2018/01/pop_US.csv", sep=",", header=T)
pop$State <- state2abbr(pop$ï..state)
pop$StateName <- pop$ï..state
glimpse(pop)


#======================================================================================================
Plot
#======================================================================================================
DATA_OVERDOSE <- "VSRR_Provisional_Drug_Overdose_Death_Counts.csv"
OD_FOCUS <- 100000 #Beyond which we will look at these states

df_od <- read_csv(here::here("data", DATA_OVERDOSE))
df_od$Date <- parse_date_time(paste(tolower(df_od$Month), df_od$Year), orders=c("by"))
df_od$NumDeaths <- df_od$`Data Value`
df_od <- df_od %>% filter(`Indicator`=='Number of Deaths' & `State` != 'US')
df_od <- df_od %>% left_join(., pop, by=c("State"="State"))
df_od$FatalitiesPerCap <- df_od$`Data Value`/df_od$pop*100
glimpse(df_od)


p1 <- ggplot(df_od, aes(x=Date, y=`FatalitiesPerCap`, group=`StateName`, colour=`StateName`)) +
  geom_line() +
  gghighlight(max_highlight = 8L, max(`FatalitiesPerCap`),  use_direct_label=FALSE, label_key=`FatalitiesPerCap`) +
  labs(title="West Virginia's Opioid Problem Stands\nIn Stark Contrast to Rest of Country", 
       subtitle = "Drug Overdoses Per Capita From the Previous 5 Years",
       caption="National Center for Health Statistics",
       x="Date", y="% Fatal Drug Overdoses Per Capita") +
  theme(panel.background = element_rect(fill = "white", colour = "grey50"),
        panel.grid.major.x = element_line(colour = "grey90"),
        panel.grid.minor.y = element_blank(),
        text=element_text(family="Lato"))

p1 <- ggplot(df_od, aes(x=Date, y=`FatalitiesPerCap`, group=`StateName`, colour=`StateName`)) +
  geom_line() +
  gghighlight(max_highlight = 8L, max(`FatalitiesPerCap`),  use_direct_label=FALSE, label_key=`FatalitiesPerCap`) +
  labs(title="West Virginia's Opioid Problem Stands\nIn Stark Contrast to Rest of Country", 
       subtitle = "Drug Overdoses Per Capita From the Previous 5 Years",
       caption="National Center for Health Statistics",
       x="Date", y="% Fatal Drug Overdoses Per Capita") +
  jtheme

p1
ggsave(here::here("plots", "fatal_drug_ods.pdf"), plot=p1, device = cairo_pdf)



#======================================================================================================
Plot
#======================================================================================================

df_ods_by_state <- aggregate(df_od, by=list(df_od$StateName), FUN=mean, na.rm=TRUE)

df_ods_by_state$StateName <- df_ods_by_state$Group.1

glimpse(df_ods_by_state)
df_ods <- df_ods_by_state %>% select(StateName, FatalitiesPerCap)
mean_ods <- mean(df_ods$FatalitiesPerCap)

df_ods$Above <- df_ods$FatalitiesPerCap > mean_ods
glimpse(df_ods)
df_ods$Above[df_ods$Above == TRUE] <- "RED"
df_ods$Above[df_ods$Above == FALSE] <- "GREEN"
  

p2 <- ggplot(df_ods, aes(x=reorder(StateName, FatalitiesPerCap), y=FatalitiesPerCap, label=format(FatalitiesPerCap, digits=2, nsmall=2))) + 
    geom_point(stat='identity', aes(col=Above), size=6)  +
    scale_color_manual(name="Fatalities By Overdose (% of Pop)", 
                     labels = c("Below Average", "Above Average"), 
                     values = c("GREEN"="#00ba38", "RED"="#f8766d")) +
  geom_text(color="black", size=2) +
  labs(title="New York and West Virginia Lie on Opposite\nPoles of the Opioid Epidemic", 
       subtitle="Fatal Drug Overdoses By State",
       caption="National Center for Health Statistics",
       x="State", y="Fatalities Per Capita (% of Population)") + 
  ylim(0, 2.0) +
  coord_flip() + 
  theme(text=element_text(family="Lato"), axis.text.y.top =10)
p2
ggsave(here::here("plots", "fatal_drug_ods_by_state.pdf"), plot=p2, device = cairo_pdf)


#======================================================================================================
Plot
#======================================================================================================
DRUG_NAMES <- c("VICODIN", "OXYCODONE", "OXYCONTIN", "PERCOCET", 
                "OPANA", "KADIAN", "AVINZA", "FENTANYL")

df_util_2014 <- read_csv(here::here("data", "State_Drug_utilization_Data_2014.csv")) %>% filter(`Product Name` %in% DRUG_NAMES)
df_util_2015 <- read_csv(here::here("data", "State_Drug_utilization_Data_2015.csv")) %>% filter(`Product Name` %in% DRUG_NAMES)
df_util_2016 <- read_csv(here::here("data", "State_Drug_utilization_Data_2016.csv")) %>% filter(`Product Name` %in% DRUG_NAMES)
df_util_2017 <- read_csv(here::here("data", "State_Drug_utilization_Data_2017.csv")) %>% filter(`Product Name` %in% DRUG_NAMES)
df_util_2018 <- read_csv(here::here("data", "State_Drug_utilization_Data_2018.csv")) %>% filter(`Product Name` %in% DRUG_NAMES)

df_util <- rbind(df_util_2014, df_util_2015, df_util_2016, df_util_2017, df_util_2018)
unique(df_util$`Product Name`)

glimpse(df_util)
df_util$Year
df_rx <- aggregate(df_util[,c("Number of Prescriptions", "Total Amount Reimbursed")], by=list(df_util$Year, df_util$`Product Name`), FUN="sum", na.rm=TRUE)
df_rx$`Drug Name` <- df_rx$Group.2
glimpse(df_rx)

p3 <-  df_rx %>% ggplot(aes(Group.1, `Total Amount Reimbursed`, size=`Number of Prescriptions`, colour=`Drug Name`)) +
  geom_point(alpha = 0.7) +
  geom_line(size=1) + 
  scale_y_continuous(labels = dollar) +
  labs(title = "Pankiller Reimbursements Shrink While\nPrescriptions Remain Fairly Constant",
       subtitle = "Expense Reimbursement & Prescriptions over the past 5 years",
       caption = "Data.Medicaid.gov",
       x = 'Year', y = 'Total $ Reimbursed') +
  theme(panel.background = element_rect(fill = "white", colour = "grey50"),
        panel.grid.major.x = element_line(colour = "grey90"),
        panel.grid.minor.y = element_blank(),
        text=element_text(family="Lato"))

p3$labels$size <- "Number of Prescriptions"
p3$labels$colour <- "Drug Name"

p3
ggsave(here::here("plots", "reimbursement_and_prescription_totals.pdf"), plot=p3, device = cairo_pdf)

df_util_state <- df_util %>% left_join(., pop, by=c("State"="State"))







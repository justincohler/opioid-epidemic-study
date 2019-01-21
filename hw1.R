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
  gghighlight(max_highlight = 5L, max(`FatalitiesPerCap`),  use_direct_label=FALSE, label_key=`FatalitiesPerCap`) +
  labs(x="Date", y="% Fatal Drug Overdoses Per Capita", 
       title="West Virginia's Opioid Problem Stands\nIn Stark Contrast to Rest of Country", 
       subtitle = "Drug Overdoses Per Capita From the Previous 5 Years"
       caption="National Center for Health Statistics") +
  theme(panel.background = element_rect(fill = "white", colour = "grey50"),
        panel.grid.major.x = element_line(colour = "grey90"),
        panel.grid.minor.y = element_blank(),
        text=element_text(family="Lato"))

p1
ggsave(here::here("plots", "fatal_drug_ods.pdf"), plot=p1, device = cairo_pdf)



#======================================================================================================
Plot
#======================================================================================================

glimpse(df_od)
df_ods_by_state <- aggregate(df_od, by=list(df_od$StateName), FUN=mean, na.rm=TRUE)

glimpse(df_ods_by_state)

df_ods_by_state[
  order(df_ods_by_state[,16])
]


ggplot(df_ods_by_state, aes(x=Group.1, y=FatalitiesPerCap, label=FatalitiesPerCap)) +
  geom_bar
  

ggplot(df_ods_by_state, aes(x=Group.1, y=FatalitiesPerCap, label=FatalitiesPerCap)) + 
    geom_point(stat='identity', size=6)  +
    scale_color_manual(name="Fatalities", 
                     labels = c("Above Average", "Below Average")) + 
  geom_text(color="green", size=2) +
  labs(title="", 
       subtitle="Fatal Drug Overdoses By State",
       caption="National Center for Health Statistics") + 
  ylim(0, 2.0) +
  coord_flip() + 
  theme(panel.background = element_rect(fill = "white", colour = "grey50"),
        panel.grid.major.x = element_line(colour = "grey90"),
        panel.grid.minor.y = element_blank(),
        text=element_text(family="Lato"))
  



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

p2 <-  df_rx %>% ggplot(aes(Group.1, `Total Amount Reimbursed`, size=`Number of Prescriptions`, colour=`Drug Name`)) +
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

p2$labels$size <- "Number of Prescriptions"
p2$labels$colour <- "Drug Name"

p2
ggsave(here::here("plots", "reimbursement_and_prescription_totals.pdf"), plot=p2, device = cairo_pdf)

df_util_state <- df_util %>% left_join(., pop, by=c("State"="State"))







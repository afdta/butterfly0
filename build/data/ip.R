library(tidyverse)
library(jsonlite)

load("/home/alec/Projects/Brookings/black-cities/build/data/ButterflyData01.RData")

#investigate NAMES
# nmsr <- sapply(ts$NAMES, function(v){return(nrow(v))})
# nmsc <- sapply(ts$NAMES, function(v){return(ncol(v))})
# twonames <- ts[which(nmsr > 1), "NAMES"]
# none have 
# twonames$NAMES[[1]]$NAME

#WHY DUPLICATES IN 1970?

one <- ts[1, ]
length(one$NAMES)

ts$name <- sapply(ts$NAMES, function(tbl){return(tbl$NAME[1])})
ts$name2 <- sapply(ts$NAMES, function(tbl){
  if(nrow(tbl) > 1){
    nm <- tbl$NAME[2]
  } else{
    nm <- NA
  }
  return(nm)
})

range((ts$WHITE + ts$BLACK + ts$OTHER) - ts$TOTAL)

#function to run regression of y on x, returning just estimated coefficient on x 
reg_e <- function(y,x){
  beta <- NA
  tryCatch({
      mod <- lm(y ~ x, na.action = na.exclude)
      beta <- mod$coefficients[2]
    },
    error = function(msg){
      #print out errors to console
      cat("!!! ERROR !!!")
      cat("  >>> ")
      cat(paste0(y, ",", x, collapse = " | "))
      cat("\n\n\n")
    }
  )
  return(beta)
}

#regress log(pop) on year, excluding observations with zero pop  
regressions <- ts %>% select(fp=STPLFIPS, nm=name, BLACK, WHITE, name, YEAR) %>%
                      mutate(lnb=ifelse(BLACK==0, NA, log(BLACK)),
                             lnw=ifelse(WHITE==0, NA, log(WHITE))) %>% 
                      group_by(fp, nm) %>% 
                      summarise(blnb = reg_e(lnb, YEAR), blnw = reg_e(lnw, YEAR))

#tack on regression coefficients to original data
#TODO figure out why there are dupes in data
all <- ts %>% select(fp=STPLFIPS, cb=CBSA, nm=name, spw=mylog10.slopeW, spb=mylog10.slopeB, qd=quadrant, cl=cityclass, ds=distPrincipal, rg=REGIONFP) %>% 
              unique() %>% inner_join(regressions, by=c("fp","nm"))


#wide pop data frame
pops <- ts %>% ungroup() %>% select(fp=STPLFIPS, b=BLACK, w=WHITE, o=OTHER, yr=YEAR) %>% gather(key="race", value="pop", b, w, o) %>% 
              mutate(raceyr=paste0(race,substr(yr,3,4))) %>% filter(!duplicated(.[c("yr","fp","race")])) %>% select("fp","raceyr","pop") %>% spread("raceyr", "pop")  

final <- inner_join(all, pops, by="fp")
                            
json <- c("var chart_data = ", toJSON(final, na="null"), ";", "export default chart_data;")

writeLines(json, "/home/alec/Projects/Brookings/black-cities/build/js/data.js")



##SCRAP / OLD CODE BELOW

dups <- all[which(duplicated(all$STPLFIPS)), ]
dups2 <- regressions[which(duplicated(regressions$STPLFIPS)), ]

# testing <- ts %>% select("YEAR", "name", "slopeB", "mylog10.slopeB") %>% mutate(log=log10(slopeB)) %>% ggplot() + geom_histogram(aes(x=log))


#WHAT'S GOING ON HERE WITH THESE DUPLICATES
dups <- ts %>% group_by(STPLFIPS, YEAR) %>% summarise(count=n())

geo <- ts %>% ungroup() %>% select(name, name2, fips=STPLFIPS, region=REGIONFP, cbsa=CBSA, t100=top100, lon=LONG, lat=LAT, class=cityclass, dist=distPrincipal, 
                     slopew=slopeW, slopeb=slopeB, quad=quadrant)

geou <- unique(geo)
nrow(geou) - length(unique(geo$fips))

#TO DO: ADDRESS DUPS UNBOX CAN ONLY TAKE DFS WITH 1 ROW -- WHY ARE THERE DUPS AT ALL?
#TO DO: DO ALL GEOS HAVE ALL YEARS FOR ALL GROUPS (W, B, O, T)?
places <- ts %>% select(f=STPLFIPS, y=YEAR, pt=TOTAL, pb=BLACK, pw=WHITE, po=OTHER, shb=PCTBLACK) %>% 
          as.data.frame() %>% split(.$f) %>% lapply(function(df){
            df$y <- paste0("y",substr(as.character(df$y),3,4))
            splt <- split(df, df$y) %>% lapply(function(singleton){return(unbox(singleton[1, c("pb", "pw", "po")]))})
          })

#DOUBLE CHECKING THAT LIST NAMES ARE CORRECTLY APPLIED -- y, f, shb, t dropped for production pb + pw + po = total
#yrs <- c("y70","y80","y90","y00","y10")
#eq <- names(places) %>% sapply(function(nm){
#  place <- places[[nm]]
#  
#  yrs <- names(places[[nm]])
#  
#  #for all yrs, check f and y vars match (lapply kept names)
#  yrlymatch <- yrs %>% sapply(function(yr){
#    return(place[[yr]]$f == nm && place[[yr]]$y == yr)
#  })
#  
#  return(sum(yrlymatch)==length(yrlymatch))
#})

#sum(eq)==length(eq)

json <- toJSON(places, na="null")
jsongeo <- geou %>% split(.$fips) %>% lapply(function(singleton){return(unbox(singleton))}) %>% toJSON(na="null")

writeLines(json, "/home/alec/Projects/Brookings/black-cities/assets/pop.json")
writeLines(jsongeo, "/home/alec/Projects/Brookings/black-cities/assets/geo.json")

#split off the repeating groups (same values for all years)


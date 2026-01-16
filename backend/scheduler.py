"""
Job Scraper Scheduler
Runs the auto scraper daily at a specified time
"""
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import logging
from auto_scraper import BongThomScraper

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


def run_scraper():
    """Execute the scraper"""
    logger.info("\n" + "="*60)
    logger.info("⏰ SCHEDULED SCRAPER TRIGGERED")
    logger.info("="*60 + "\n")
    
    try:
        scraper = BongThomScraper()
        scraper.run()
    except Exception as e:
        logger.error(f"❌ Scraper failed: {str(e)}", exc_info=True)


if __name__ == "__main__":
    scheduler = BlockingScheduler()
    
    # Schedule to run every 2 days at 2:00 AM
    scheduler.add_job(
        run_scraper,
        CronTrigger(day='*/2', hour=2, minute=0),  # Run every 2 days at 2:00 AM
        id='bongthom_scraper',
        name='BongThom Daily Job Scraper',
        replace_existing=True
    )
    
    logger.info("🚀 Scheduler started!")
    logger.info("📅 Next run scheduled for: 2:00 AM daily")
    logger.info("⏸️  Press Ctrl+C to stop the scheduler\n")
    
    # Optionally run once immediately on startup
    logger.info("▶️  Running scraper immediately on startup...")
    run_scraper()
    
    # Start the scheduler
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("\n🛑 Scheduler stopped by user")

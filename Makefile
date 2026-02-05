SYSNAM   = DataDashboard

# Is this an official or sandbox build?
ifeq ($(findstring sandbox, $(CURDIR)),sandbox)
	VERNUM  = ""
	RELDIR  = $(subst build,,$(CURDIR))
else
	VERNUM = $(shell basename `pwd`)
	RELDIR = /www/staff/$(SYSNAM)/$(VERNUM)
endif

BUILDDIR = build

install:
		@echo "rsync -abvhHS --recursive $(BUILDDIR)/ /$(RELDIR)/"
		rsync -abvhHS --recursive $(BUILDDIR)/ /$(RELDIR)/
		@if [ "$(VERNUM)" != "" ]; then \
				echo "cd $(RELDIR)/..; rm rel; ln -s $(VERNUM) rel;"; \
				cd $(RELDIR)/..; \
				rm rel; \
				ln -s $(VERNUM) rel; \
		fi

show:
		@echo CURDIR = $(CURDIR)
		@echo SYSNAM = $(SYSNAM)
		@echo VERNUM = $(VERNUM)
		@echo RELDIR = $(RELDIR)                                 
